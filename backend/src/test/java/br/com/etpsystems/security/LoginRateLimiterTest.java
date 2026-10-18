package br.com.etpsystems.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.time.Clock;
import java.util.concurrent.Executors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import jakarta.servlet.FilterChain;

class LoginRateLimiterTest {
    @Test
    void blocksUntilWindowExpiresWithoutExtendingItAndSeparatesAddresses() {
        Clock clock = mock(Clock.class);
        when(clock.millis()).thenReturn(1000L);
        var limiter = new LoginRateLimiter(2, 60, clock);
        assertThat(limiter.retryAfter("a")).isZero();
        assertThat(limiter.retryAfter("a")).isZero();
        assertThat(limiter.retryAfter("a")).isEqualTo(60);
        assertThat(limiter.retryAfter("b")).isZero();
        when(clock.millis()).thenReturn(60500L);
        assertThat(limiter.retryAfter("a")).isEqualTo(1);
        when(clock.millis()).thenReturn(61000L);
        assertThat(limiter.retryAfter("a")).isZero();
    }

    @Test
    void concurrentRequestsCannotExceedLimit() throws Exception {
        var limiter = new LoginRateLimiter(10, 60, Clock.fixed(java.time.Instant.EPOCH, java.time.ZoneOffset.UTC));
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var results = executor.invokeAll(IntStream.range(0, 100)
                    .<java.util.concurrent.Callable<Long>>mapToObj(i -> () -> limiter.retryAfter("a")).toList());
            int allowed = 0;
            for (var result : results) if (result.get() == 0) allowed++;
            assertThat(allowed).isEqualTo(10);
        }
    }

    @Test
    void filterReturns429IgnoresSpoofedHeadersAndLeavesOtherRoutesAvailable() throws Exception {
        var filter = new LoginRateLimitFilter(new LoginRateLimiter(1, 60));
        FilterChain chain = mock(FilterChain.class);
        var request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setServletPath("/api/auth/login");
        filter.doFilter(request, new MockHttpServletResponse(), chain);
        request.addHeader("X-Forwarded-For", "192.0.2.50");
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(Long.parseLong(response.getHeader("Retry-After"))).isBetween(1L, 60L);
        assertThat(response.getContentAsString()).contains("Muitas tentativas");
        verify(chain, times(1)).doFilter(any(), any());
        request.setServletPath("/api/auth/me");
        filter.doFilter(request, new MockHttpServletResponse(), chain);
        request.setServletPath("/api/auth/login");
        request.setMethod("OPTIONS");
        filter.doFilter(request, new MockHttpServletResponse(), chain);
        verify(chain, times(3)).doFilter(any(), any());
    }
}
