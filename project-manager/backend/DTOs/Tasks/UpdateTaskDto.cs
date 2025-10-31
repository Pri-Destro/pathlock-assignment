using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Tasks;

public class UpdateTaskDto
{
    [Required]
    public Guid Id { get; set; }

    // Optional fields for partial updates
    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public bool? Completed { get; set; }
}
