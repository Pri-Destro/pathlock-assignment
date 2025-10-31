using backend.DTOs.Projects;

namespace backend.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetProjectsAsync(Guid userId);
    Task<ProjectDto> GetProjectAsync(Guid userId, Guid projectId);
    Task<ProjectDto> CreateProjectAsync(Guid userId, CreateProjectDto dto);
    Task DeleteProjectAsync(Guid userId, Guid projectId);
}
