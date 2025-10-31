using backend.DTOs.Tasks;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _tasks;

    public TasksController(ITaskService tasks) => _tasks = tasks;

    [HttpPost("projects/{projectId:guid}/tasks")]
    public async Task<IActionResult> CreateTask(Guid projectId, [FromBody] CreateTaskDto dto)
    {
        var uid = User.GetUserId();
        if (uid == Guid.Empty) return Unauthorized();

        try
        {
            var created = await _tasks.CreateTaskAsync(uid, projectId, dto);
            return CreatedAtAction(nameof(GetTask), new { taskId = created.Id }, created);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("projects/{projectId:guid}/tasks")]
    public async Task<IActionResult> GetTasksForProject(Guid projectId)
    {
        var uid = User.GetUserId();
        if (uid == Guid.Empty) return Unauthorized();
        try
        {
            var tasks = await _tasks.GetTasksByProjectAsync(uid, projectId);
            return Ok(tasks);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("tasks/{taskId:guid}")]
    public async Task<IActionResult> UpdateTask(Guid taskId, [FromBody] UpdateTaskDto dto)
    {
        var uid = User.GetUserId();
        if (uid == Guid.Empty) return Unauthorized();

        if (dto.Id != taskId) return BadRequest("Id mismatch");

        try
        {
            var updated = await _tasks.UpdateTaskAsync(uid, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("tasks/{taskId:guid}")]
    public async Task<IActionResult> DeleteTask(Guid taskId)
    {
        var uid = User.GetUserId();
        if (uid == Guid.Empty) return Unauthorized();

        try
        {
            await _tasks.DeleteTaskAsync(uid, taskId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    // optional for CreatedAtAction
    [HttpGet("tasks/{taskId:guid}")]
    public IActionResult GetTask(Guid taskId) => NotFound();
}
