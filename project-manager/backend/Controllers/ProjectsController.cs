using backend.DTOs.Projects;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _proj;

    public ProjectsController(IProjectService proj) => _proj = proj;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var uid = User.GetUserId();
        if (uid == Guid.Empty) return Unauthorized();
        var projects = await _proj.GetProjectsAsync(uid);
        return Ok(projects);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
    {
        var uid = User.GetUserId();
        if (uid == Guid.Empty) return Unauthorized();
        var created = await _proj.CreateProjectAsync(uid, dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var uid = User.GetUserId();
        if (uid == Guid.Empty) return Unauthorized();
        try
        {
            var project = await _proj.GetProjectAsync(uid, id);
            return Ok(project);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var uid = User.GetUserId();
        if (uid == Guid.Empty) return Unauthorized();
        try
        {
            await _proj.DeleteProjectAsync(uid, id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
