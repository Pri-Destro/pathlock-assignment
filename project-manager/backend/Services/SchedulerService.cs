using backend.DTOs.Scheduler;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Services;

public class SchedulerService : ISchedulerService
{
    private readonly AppDbContext _db;
    public SchedulerService(AppDbContext db) { _db = db; }

    public async Task<ScheduleResponseDto> CreateScheduleAsync(Guid userId, Guid projectId, ScheduleRequestDto request, double workHoursPerDay = 8.0)
    {
        var res = new ScheduleResponseDto();

        var project = await _db.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project == null)
            return res; // silently ignore if not owned

        var tasks = request.Tasks;
        var byTitle = tasks.ToDictionary(t => t.Title, StringComparer.OrdinalIgnoreCase);

        // Build dependency graph
        var graph = tasks.ToDictionary(t => t.Title, t => t.Dependencies ?? new List<string>(), StringComparer.OrdinalIgnoreCase);

        // Topological sort with heuristics
        var indegree = new Dictionary<string,int>(StringComparer.OrdinalIgnoreCase);
        foreach (var t in tasks) indegree[t.Title] = 0;
        foreach (var kv in graph)
            foreach (var dep in kv.Value)
                if (indegree.ContainsKey(dep)) indegree[dep]++;

        var now = DateTime.UtcNow;
        var queue = new List<ScheduleTaskInput>();
        foreach (var t in tasks.Where(t => indegree[t.Title] == 0)) queue.Add(t);

        double SlackHours(ScheduleTaskInput t)
        {
            if (t.DueDate == null) return double.PositiveInfinity;
            return (t.DueDate.Value.ToUniversalTime() - now).TotalHours - t.EstimatedHours;
        }

        var ordered = new List<ScheduleTaskInput>();
        while (queue.Any())
        {
            queue = queue
                .OrderBy(t => SlackHours(t))
                .ThenBy(t => t.DueDate ?? DateTime.MaxValue)
                .ThenBy(t => t.EstimatedHours)
                .ToList();

            var current = queue.First();
            queue.RemoveAt(0);
            ordered.Add(current);

            foreach (var neigh in graph[current.Title])
            {
                if (!indegree.ContainsKey(neigh)) continue;
                indegree[neigh]--;
                if (indegree[neigh] == 0)
                    queue.Add(byTitle[neigh]);
            }
        }

        // Add any leftover (cycles etc.)
        if (ordered.Count != tasks.Count)
        {
            var remaining = tasks
                .Select(t => t.Title)
                .Except(ordered.Select(t => t.Title), StringComparer.OrdinalIgnoreCase);

            ordered.AddRange(remaining.Select(r => byTitle[r]));
        }

        res.RecommendedOrder = ordered
            .Select(t => new ScheduleTaskResult
            {
                TaskId = t.TaskId,
                Title = t.Title
            })
            .ToList();

        return res;
    }
}
