# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY backend.csproj ./
RUN dotnet restore

# Copy all files and folders (including your db and source code)
COPY . ./

# Publish
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy published app and database file
COPY --from=build /app/publish .
COPY projectmanager.db ./projectmanager.db

# Set environment and expose default port
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Entry point
ENTRYPOINT ["dotnet", "backend.dll"]
