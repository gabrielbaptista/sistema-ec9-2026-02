using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Sglv.Infrastructure.Identity;

namespace Sglv.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>()
            .Property(user => user.FullName)
            .HasMaxLength(200);

        foreach (var property in builder.Model.GetEntityTypes()
                     .SelectMany(entity => entity.GetProperties()))
        {
            if (property.ClrType == typeof(decimal))
            {
                property.SetPrecision(18);
                property.SetScale(2);
            }
            else if (property.ClrType == typeof(DateTimeOffset))
            {
                property.SetValueConverter(new ValueConverter<DateTimeOffset, DateTimeOffset>(
                    value => value.ToUniversalTime(),
                    value => value.ToUniversalTime()));
            }
            else if (property.ClrType == typeof(DateTimeOffset?))
            {
                property.SetValueConverter(new ValueConverter<DateTimeOffset?, DateTimeOffset?>(
                    value => value.HasValue ? value.Value.ToUniversalTime() : value,
                    value => value.HasValue ? value.Value.ToUniversalTime() : value));
            }
        }
    }
}
