using Microsoft.EntityFrameworkCore;
using Sglv.Infrastructure.Persistence;
using Testcontainers.MsSql;

namespace Sglv.Tests;

public sealed class DatabaseMigrationTests
{
    [Fact]
    public async Task AppliesInitialMigrationToAnEmptySqlServer()
    {
        await using var sqlServer = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest").Build();
        await sqlServer.StartAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(sqlServer.GetConnectionString())
            .Options;

        await using var dbContext = new AppDbContext(options);
        await dbContext.Database.MigrateAsync();

        Assert.True(await dbContext.Database.CanConnectAsync());
        Assert.True(await dbContext.Database.GetAppliedMigrationsAsync() is { } migrations
            && migrations.Any());
    }
}
