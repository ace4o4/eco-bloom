# Use the official Python 3.10 image
FROM python:3.10-slim

# Set up a new user named "user" with user ID 1000
RUN useradd -m -u 1000 user

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# COPY requirements.txt first to leverage Docker cache
COPY --chown=user requirements.txt $HOME/app/requirements.txt

# Install CPU-only PyTorch first to keep image size small
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the dependencies
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the rest of the application code
COPY --chown=user . $HOME/app

# Expose the port that the application listens on (HF Spaces uses 7860)
EXPOSE 7860

# CMD to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
