FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/api/Api/Sglv.Api.csproj src/api/Api/
COPY src/api/Application/Sglv.Application.csproj src/api/Application/
COPY src/api/Domain/Sglv.Domain.csproj src/api/Domain/
COPY src/api/Infrastructure/Sglv.Infrastructure.csproj src/api/Infrastructure/
RUN dotnet restore src/api/Api/Sglv.Api.csproj

COPY . .
RUN dotnet publish src/api/Api/Sglv.Api.csproj -c Release --no-restore -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Sglv.Api.dll"]
