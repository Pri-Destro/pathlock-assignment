using backend.Data;
using backend.DTOs.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;

    public TaskService(AppDbContext db) => _db = db;

    public async Task<TaskDto> CreateTaskAsync(Guid userId, Guid projectId, CreateTaskDto dto)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
        if (project == null) throw new KeyNotFoundException("Project not found or not owned by user.");

        var task = new ProjectTask {
            ProjectId = projectId,
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return MapToDto(task);
    }

    public async Task<TaskDto> UpdateTaskAsync(Guid userId, UpdateTaskDto dto)
    {
        var task = await _db.Tasks.Include(t => t.Project).FirstOrDefaultAsync(t => t.Id == dto.Id);
        if (task == null || task.Project!.UserId != userId) throw new KeyNotFoundException("Task not found or not owned by user.");

        // Only update fields that are provided in the DTO
        if (dto.Title != null) task.Title = dto.Title;
        if (dto.Description != null) task.Description = dto.Description;
        if (dto.DueDate.HasValue) task.DueDate = dto.DueDate;
        if (dto.Completed.HasValue) task.Completed = dto.Completed.Value;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(task);
    }

    public async Task DeleteTaskAsync(Guid userId, Guid taskId)
    {
        var task = await _db.Tasks.Include(t => t.Project).FirstOrDefaultAsync(t => t.Id == taskId);
        if (task == null || task.Project!.UserId != userId) throw new KeyNotFoundException("Task not found or not owned by user.");
        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<TaskDto>> GetTasksByProjectAsync(Guid userId, Guid projectId)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
        if (project == null) throw new KeyNotFoundException("Project not found or not owned by user.");

        return await _db.Tasks
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto {
                Id = t.Id,
                ProjectId = t.ProjectId,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                Completed = t.Completed,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToListAsync();
    }

    private static TaskDto MapToDto(ProjectTask t) => new TaskDto {
        Id = t.Id,
        ProjectId = t.ProjectId,
        Title = t.Title,
        Description = t.Description,
        DueDate = t.DueDate,
        Completed = t.Completed,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}
