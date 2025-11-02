using backend.DTOs.Scheduler;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/projects/{projectId:guid}/schedule")]
[Authorize]
public class SchedulerController : ControllerBase
{
    private readonly ISchedulerService _scheduler;

    public SchedulerController(ISchedulerService scheduler) => _scheduler = scheduler;

    [HttpPost]
    public async Task<IActionResult> CreateSchedule(Guid projectId, [FromBody] ScheduleRequestDto request)
    {
        var userId = User.GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var res = await _scheduler.CreateScheduleAsync(userId, projectId, request);
        return Ok(res);
    }
}
