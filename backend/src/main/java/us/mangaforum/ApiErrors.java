package us.mangaforum;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler({ConstraintViolationException.class, MethodArgumentNotValidException.class})
    ResponseEntity<ProblemDetail> invalidParameter(Exception exception) {
        return ResponseEntity.badRequest().body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Check the submitted fields and try again."));
    }
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ProblemDetail> requestError(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode()).body(ProblemDetail.forStatusAndDetail(exception.getStatusCode(), exception.getReason() == null ? "Request failed." : exception.getReason()));
    }
}
