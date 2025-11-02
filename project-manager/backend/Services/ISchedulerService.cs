using backend.DTOs.Scheduler;

namespace backend.Services;

public interface ISchedulerService
{
    Task<ScheduleResponseDto> CreateScheduleAsync(Guid userId, Guid projectId, ScheduleRequestDto request, double workHoursPerDay = 8.0);
}
