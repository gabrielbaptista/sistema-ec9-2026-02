namespace Sglv.Domain.Authorization;

public static class UserRoles
{
    public const string Customer = "Cliente";
    public const string Attendant = "Atendente";
    public const string Operator = "Operador";
    public const string Administrator = "Administrador";

    public static readonly string[] All =
    [
        Customer,
        Attendant,
        Operator,
        Administrator
    ];
}
