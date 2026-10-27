using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sglv.Application.Authentication;
using Sglv.Domain.Authorization;

namespace Sglv.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public sealed class SessionController : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType<AuthenticatedUser>(StatusCodes.Status200OK)]
    public ActionResult<AuthenticatedUser> GetCurrentUser()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (!Guid.TryParse(id, out var userId) || string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        return Ok(new AuthenticatedUser(
            userId,
            email,
            User.FindAll(ClaimTypes.Role).Select(claim => claim.Value).ToArray()));
    }

    [HttpGet("portal")]
    [Authorize(Roles = UserRoles.Customer)]
    public IActionResult GetPortal()
    {
        return Ok(new { message = "Área do cliente autenticada." });
    }

    [HttpGet("admin")]
    [Authorize(Roles = UserRoles.Attendant + "," + UserRoles.Operator + "," + UserRoles.Administrator)]
    public IActionResult GetAdmin()
    {
        return Ok(new { message = "Área administrativa autenticada." });
    }
}
