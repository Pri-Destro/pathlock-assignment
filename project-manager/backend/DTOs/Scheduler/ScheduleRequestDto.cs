using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Scheduler;

public class ScheduleTaskInput
{
    public Guid? TaskId { get; set; } // Optional if already stored
    [Required] public string Title { get; set; } = null!;
    [Range(0.0, double.MaxValue)] public double EstimatedHours { get; set; }
    public DateTime? DueDate { get; set; }
    public List<string> Dependencies { get; set; } = new();
}

public class ScheduleRequestDto
{
    [Required]
    public List<ScheduleTaskInput> Tasks { get; set; } = new();
}
