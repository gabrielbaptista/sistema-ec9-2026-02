using Microsoft.AspNetCore.Identity;
using Sglv.Domain.Authorization;

namespace Sglv.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        foreach (var role in UserRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(new IdentityRole<Guid>(role));
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Could not create the '{role}' role: {string.Join(", ", result.Errors.Select(error => error.Description))}");
                }
            }
        }
    }
}
