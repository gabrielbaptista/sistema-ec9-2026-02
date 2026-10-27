namespace Sglv.Application.Authentication;

public sealed record AuthenticatedUser(Guid Id, string Email, IReadOnlyCollection<string> Roles);

public sealed record AuthSession(AuthenticatedUser User, string Token, DateTimeOffset ExpiresAt);

public sealed record RegistrationResult(AuthSession? Session, IReadOnlyCollection<string> Errors);

public interface IAuthService
{
    Task<RegistrationResult> RegisterAsync(string fullName, string email, string password);
    Task<AuthSession?> LoginAsync(string email, string password);
}
