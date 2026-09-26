package us.mangaforum;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ProblemDetail> invalidParameter(ConstraintViolationException exception) {
        return ResponseEntity.badRequest().body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid catalog filter or page number."));
    }
}
