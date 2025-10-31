using System;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Extensions;

public static class ClaimsPrincipalExtensions
{
    // Returns Guid.Empty if not found / invalid
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        // try claim "uid", then JWT "sub", then NameIdentifier
        var uid = user.FindFirst("uid")?.Value
               ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
               ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (Guid.TryParse(uid, out var guid)) return guid;
        return Guid.Empty;
    }
}
