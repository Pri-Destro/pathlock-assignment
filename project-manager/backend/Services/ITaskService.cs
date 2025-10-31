using backend.DTOs.Tasks;

namespace backend.Services;

public interface ITaskService
{
    Task<TaskDto> CreateTaskAsync(Guid userId, Guid projectId, CreateTaskDto dto);
    Task<TaskDto> UpdateTaskAsync(Guid userId, UpdateTaskDto dto);
    Task DeleteTaskAsync(Guid userId, Guid taskId);
    Task<IEnumerable<TaskDto>> GetTasksByProjectAsync(Guid userId, Guid projectId);
}
