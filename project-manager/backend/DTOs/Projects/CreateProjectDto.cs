using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Projects;

public class CreateProjectDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }
}
