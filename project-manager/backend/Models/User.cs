using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string PasswordHash { get; set; } = null!;

    public string? Name { get; set; }

    public ICollection<Project>? Projects { get; set; }
}
