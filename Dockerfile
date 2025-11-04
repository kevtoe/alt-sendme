# Simple runtime Dockerfile for AltSendme
# This packages a pre-built binary into a Docker image for easy deployment

FROM debian:bookworm-slim

# Install runtime dependencies for Tauri/GTK applications
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-0 \
    libgtk-3-0 \
    libayatana-appindicator3-1 \
    librsvg2-2 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN useradd -m -u 1000 appuser

# Set working directory
WORKDIR /app

# Copy the pre-built binary
# This will be provided by the CI/CD workflow or manual build
COPY alt-sendme /app/alt-sendme
RUN chmod +x /app/alt-sendme

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV DISPLAY=:0
ENV RUST_LOG=info

# Run the application
CMD ["/app/alt-sendme"]
