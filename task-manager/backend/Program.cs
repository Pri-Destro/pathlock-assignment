using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<TaskStore>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

app.UseCors("AllowAll");

// GET /api/tasks
app.MapGet("/api/tasks", (TaskStore store) =>
{
    return Results.Ok(store.GetAll());
})
.WithName("GetTasks");


// POST /api/tasks
app.MapPost("/api/tasks", ([FromBody] CreateTaskRequest request, TaskStore store) =>
{
    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return Results.BadRequest("Description is required");
    }

    var task = new TaskItem
    {
        Id = Guid.NewGuid(),
        Description = request.Description,
        Details = request.Details ?? string.Empty,
        IsCompleted = false
    };

    store.Add(task);
    return Results.Created($"/api/tasks/{task.Id}", task);
})
.WithName("CreateTask");


// PUT /api/tasks/{id}
app.MapPut("/api/tasks/{id}", (Guid id, [FromBody] UpdateTaskRequest request, TaskStore store) =>
{
    var task = store.GetById(id);
    if (task == null)
    {
        return Results.NotFound();
    }

    if (!string.IsNullOrWhiteSpace(request.Description))
    {
        task.Description = request.Description;
    }

    if (request.Details != null)
    {
        task.Details = request.Details;
    }

    task.IsCompleted = request.IsCompleted;
    store.Update(task);

    return Results.Ok(task);
})
.WithName("UpdateTask");


// DELETE /api/tasks/{id}
app.MapDelete("/api/tasks/{id}", (Guid id, TaskStore store) =>
{
    var task = store.GetById(id);
    if (task == null)
    {
        return Results.NotFound();
    }

    store.Delete(id);
    return Results.NoContent();
})
.WithName("DeleteTask");

app.MapGet("/api/health", () =>
{
    return Results.Ok(new { status = "Backend is running"});
})
.WithName("HealthCheck");

app.Run();

// Models
public class TaskItem
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}

public class CreateTaskRequest
{
    public string Description { get; set; } = string.Empty;
    public string? Details { get; set; }
}

public class UpdateTaskRequest
{
    public string Description { get; set; } = string.Empty;
    public string? Details { get; set; }
    public bool IsCompleted { get; set; }
}

// In-memory storage
public class TaskStore
{
    private readonly List<TaskItem> _tasks = new();

    public IEnumerable<TaskItem> GetAll() => _tasks;

    public TaskItem? GetById(Guid id) => _tasks.FirstOrDefault(t => t.Id == id);

    public void Add(TaskItem task)
    {
        _tasks.Add(task);
    }

    public void Update(TaskItem task)
    {
        var existingTask = GetById(task.Id);
        if (existingTask != null)
        {
            existingTask.Description = task.Description;
            existingTask.Details = task.Details;
            existingTask.IsCompleted = task.IsCompleted;
        }
    }

    public void Delete(Guid id)
    {
        var task = GetById(id);
        if (task != null)
        {
            _tasks.Remove(task);
        }
    }
}
