package br.com.etpsystems.assessment;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AulaRepository extends JpaRepository<Aula, UUID> {
    List<Aula> findByCurso_IdOrderByOrdem(UUID cursoId);
    long countByCurso_Id(UUID cursoId);

    interface CourseLessonCount {
        UUID getCourseId();
        long getLessonCount();
    }

    @Query("select a.curso.id as courseId, count(a) as lessonCount from Aula a where a.curso.id in :courseIds group by a.curso.id")
    List<CourseLessonCount> countByCourses(List<UUID> courseIds);
}
