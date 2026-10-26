"""Exercise the real activation script in a temporary filesystem, without Docker/SSH."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "deploy/oracle/activate-release.sh"


class ActivationTest(unittest.TestCase):
    def run_deploy(self, *, changed=False, healthy=True, legacy=False, invalid=False):
        with tempfile.TemporaryDirectory(prefix="etp-deploy-test-") as temp:
            root = Path(temp)
            app = root / "app"
            stage = root / "incoming" / ("a" * 40)
            (app / "frontend").mkdir(parents=True)
            (stage / "frontend/assets").mkdir(parents=True)
            (app / "frontend/index.html").write_text("old page")
            (app / "etp-backend.jar").write_text("old jar")
            (app / "backend-source").write_text("b" * 40)
            (app / "deployed-commit").write_text("d" * 40)
            (stage / "frontend/index.html").write_text("new page")
            (stage / "etp-backend.jar").write_text("new jar")
            fingerprint = "c" * 40 if changed else "b" * 40
            if not legacy:
                (stage / "backend-source").write_text("invalid" if invalid else fingerprint)
            script = SCRIPT.read_text().replace("/opt/etp-systems", str(app))
            script = script.replace("/home/etpdeploy/incoming", str(root / "incoming"))
            script = script.replace("/run/lock/etp-deploy.lock", str(root / "lock"))
            script_path = root / "activate.sh"
            script_path.write_text(script)
            bins = root / "bin"
            bins.mkdir()
            mocks = {
                "stat": "echo etpdeploy",
                "docker": 'echo "$*" >> "$TEST_LOG"; if [[ $1 == exec ]]; then echo dump; fi',
                "curl": "exit 0" if healthy else "exit 1",
                "sleep": ":",
            }
            for name, body in mocks.items():
                path = bins / name
                path.write_text("#!/usr/bin/env bash\n" + body + "\n")
                path.chmod(0o755)
            log = root / "docker.log"
            env = dict(os.environ, PATH=f"{bins}:{os.environ['PATH']}", TEST_LOG=str(log))
            result = subprocess.run(["bash", str(script_path), "a" * 40], env=env,
                                    capture_output=True, text=True)
            calls = log.read_text() if log.exists() else ""
            restart = changed or legacy
            self.assertEqual(result.returncode, 0 if healthy and not invalid else 1,
                             result.stdout + result.stderr)
            if invalid:
                self.assertEqual(calls, "")
                self.assertEqual((app / "frontend/index.html").read_text(), "old page")
                return
            self.assertEqual(calls.count("--force-recreate"), (1 if healthy else 2) if restart else 0)
            self.assertEqual("mysqldump" in calls, restart)
            self.assertEqual((app / "etp-backend.jar").read_text(),
                             "new jar" if healthy and restart else "old jar")
            self.assertEqual((app / "frontend/index.html").read_text(), "new page" if healthy else "old page")
            self.assertEqual((app / "deployed-commit").read_text().strip(), "a" * 40 if healthy else "d" * 40)
            if healthy and legacy:
                self.assertFalse((app / "backend-source").exists())
            else:
                self.assertEqual((app / "backend-source").read_text().strip(), fingerprint if healthy else "b" * 40)
            self.assertEqual(stage.exists(), not healthy)

    def test_frontend_does_not_restart_or_dump_database(self):
        self.run_deploy()

    def test_backend_restarts_and_backs_up_database(self):
        self.run_deploy(changed=True)

    def test_backend_failure_restores_jar_page_and_marker(self):
        self.run_deploy(changed=True, healthy=False)

    def test_frontend_failure_restores_page_without_restart(self):
        self.run_deploy(healthy=False)

    def test_legacy_package_restarts_and_clears_stale_marker(self):
        self.run_deploy(legacy=True)

    def test_invalid_marker_rejected_before_mutation(self):
        self.run_deploy(invalid=True)


if __name__ == "__main__":
    unittest.main()
