using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Tasks;

public class CreateTaskDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
}
