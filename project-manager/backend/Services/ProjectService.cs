using backend.Data;
using backend.DTOs.Projects;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;

    public ProjectService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<ProjectDto>> GetProjectsAsync(Guid userId)
    {
        return await _db.Projects
            .Where(p => p.UserId == userId)
            .Select(p => new ProjectDto {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                CreatedAt = p.CreatedAt
            }).ToListAsync();
    }

    public async Task<ProjectDto> GetProjectAsync(Guid userId, Guid projectId)
    {
        var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == projectId && x.UserId == userId);
        if (p == null) throw new KeyNotFoundException("Project not found.");
        return new ProjectDto {
            Id = p.Id, Title = p.Title, Description = p.Description, CreatedAt = p.CreatedAt
        };
    }

    public async Task<ProjectDto> CreateProjectAsync(Guid userId, CreateProjectDto dto)
    {
        var p = new Project {
            UserId = userId,
            Title = dto.Title,
            Description = dto.Description
        };
        _db.Projects.Add(p);
        await _db.SaveChangesAsync();
        return new ProjectDto { Id = p.Id, Title = p.Title, Description = p.Description, CreatedAt = p.CreatedAt };
    }

    public async Task DeleteProjectAsync(Guid userId, Guid projectId)
    {
        var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == projectId && x.UserId == userId);
        if (p == null) throw new KeyNotFoundException("Project not found.");
        _db.Projects.Remove(p);
        await _db.SaveChangesAsync();
    }
}
