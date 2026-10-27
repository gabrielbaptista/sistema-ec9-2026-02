using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Sglv.Application.Authentication;
using Sglv.Domain.Authorization;
using Sglv.Infrastructure.Identity;

namespace Sglv.Infrastructure.Authentication;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string SigningKey { get; set; } = string.Empty;
    public int LifetimeMinutes { get; set; } = 60;
}

public sealed class IdentityAuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IOptions<JwtOptions> jwtOptions,
    TimeProvider timeProvider) : IAuthService
{
    public async Task<RegistrationResult> RegisterAsync(string fullName, string email, string password)
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FullName = fullName.Trim(),
            UserName = email.Trim(),
            Email = email.Trim()
        };

        var createResult = await userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            return new RegistrationResult(null, createResult.Errors.Select(error => error.Description).ToArray());
        }

        var roleResult = await userManager.AddToRoleAsync(user, UserRoles.Customer);
        if (!roleResult.Succeeded)
        {
            await userManager.DeleteAsync(user);
            return new RegistrationResult(null, roleResult.Errors.Select(error => error.Description).ToArray());
        }

        return new RegistrationResult(await CreateSessionAsync(user), []);
    }

    public async Task<AuthSession?> LoginAsync(string email, string password)
    {
        var user = await userManager.FindByEmailAsync(email.Trim());
        if (user is null)
        {
            return null;
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
        return result.Succeeded ? await CreateSessionAsync(user) : null;
    }

    private async Task<AuthSession> CreateSessionAsync(ApplicationUser user)
    {
        var options = jwtOptions.Value;
        var now = timeProvider.GetUtcNow();
        var expiresAt = now.AddMinutes(options.LifetimeMinutes);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email ?? string.Empty)
        };

        claims.AddRange((await userManager.GetRolesAsync(user))
            .Select(role => new Claim(ClaimTypes.Role, role)));

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SigningKey)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            options.Issuer,
            options.Audience,
            claims,
            now.UtcDateTime,
            expiresAt.UtcDateTime,
            credentials);

        return new AuthSession(
            new AuthenticatedUser(
                user.Id,
                user.Email ?? string.Empty,
                (await userManager.GetRolesAsync(user)).ToArray()),
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt);
    }
}
