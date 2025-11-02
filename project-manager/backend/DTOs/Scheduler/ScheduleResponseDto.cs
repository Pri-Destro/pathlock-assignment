namespace backend.DTOs.Scheduler;

public class ScheduleTaskResult
{
    public Guid? TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
}

public class ScheduleResponseDto
{
    public List<ScheduleTaskResult> RecommendedOrder { get; set; } = new();
}
