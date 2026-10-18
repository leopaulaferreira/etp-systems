package br.com.etpsystems.security;

import java.time.Clock;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Limite local por endereço de conexão, antes da validação de senha. */
@Component
public class LoginRateLimiter {
    private record Window(long expiresAt, int requests) {}
    private final Map<String, Window> windows = new HashMap<>();
    private final int maxRequests;
    private final long windowMillis;
    private final Clock clock;
    private static final int MAX_ADDRESSES = 10_000;

    @org.springframework.beans.factory.annotation.Autowired
    public LoginRateLimiter(
            @Value("${etp.security.login.max-requests:10}") int maxRequests,
            @Value("${etp.security.login.window-seconds:60}") int windowSeconds) {
        this(maxRequests, windowSeconds, Clock.systemUTC());
    }

    LoginRateLimiter(int maxRequests, int windowSeconds, Clock clock) {
        if (maxRequests < 1 || windowSeconds < 1) {
            throw new IllegalArgumentException("Os limites de login devem ser positivos");
        }
        this.maxRequests = maxRequests;
        this.windowMillis = windowSeconds * 1000L;
        this.clock = clock;
    }

    /** Retorna zero quando permitido ou segundos até uma nova tentativa. */
    public synchronized long retryAfter(String address) {
        long now = clock.millis();
        windows.entrySet().removeIf(entry -> entry.getValue().expiresAt() <= now);
        Window current = windows.get(address);
        if (current == null) {
            // Não remove limites ativos quando a capacidade é atingida.
            if (windows.size() >= MAX_ADDRESSES) return Math.max(1, windowMillis / 1000);
            windows.put(address, new Window(now + windowMillis, 1));
            return 0;
        }
        if (current.requests() >= maxRequests) {
            return Math.max(1, (current.expiresAt() - now + 999) / 1000);
        }
        windows.put(address, new Window(current.expiresAt(), current.requests() + 1));
        return 0;
    }
}
