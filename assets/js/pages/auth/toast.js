// Track active toasts to prevent duplicates
export const activeToasts = new Map();

// Toast notification system
export function showToast(message, type = "error") {
  const toastContainer = document.getElementById("toastContainer");
  
  // Check if this message already exists
  if (activeToasts.has(message)) {
    const existingToast = activeToasts.get(message);
    const counter = existingToast.counter;
    counter.count++;
    counter.element.textContent = counter.count;
    counter.element.style.display = "flex";
    
    // Reset the auto-remove timer
    clearTimeout(existingToast.timeout);
    existingToast.timeout = setTimeout(() => {
      removeToast(existingToast.element, message);
    }, 5000);
    
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  toast.innerHTML = `
    <div class="toast-icon ${type}"></div>
    <div class="toast-message">${message}</div>
    <div class="toast-counter">1</div>
    <button class="toast-close">×</button>
  `;

  toastContainer.appendChild(toast);

  const counterElement = toast.querySelector(".toast-counter");
  counterElement.style.display = "none";

  // Close button handler
  const closeButton = toast.querySelector(".toast-close");
  closeButton.addEventListener("click", () => {
    removeToast(toast, message);
  });

  // Track this toast
  const toastTimeout = setTimeout(() => {
    removeToast(toast, message);
  }, 5000);
  
  activeToasts.set(message, {
    element: toast,
    counter: { element: counterElement, count: 1 },
    timeout: toastTimeout,
    isPaused: false
  });

  // Pause auto-remove on hover
  toast.addEventListener("mouseenter", () => {
    const toastData = activeToasts.get(message);
    if (toastData) {
      clearTimeout(toastData.timeout);
      toastData.isPaused = true;
    }
  });

  // Resume auto-remove on mouse leave
  toast.addEventListener("mouseleave", () => {
    const toastData = activeToasts.get(message);
    if (toastData && toastData.isPaused) {
      toastData.timeout = setTimeout(() => {
        removeToast(toast, message);
      }, 5000);
      toastData.isPaused = false;
    }
  });


  // Swipe gesture handling
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  let startTime = 0;

  const handleTouchStart = (e) => {
    startY = e.touches[0].clientY;
    currentY = startY;
    startTime = Date.now();
    isDragging = true;
    toast.style.transition = "none";
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Allow swiping down (positive deltaY) or up (negative deltaY)
    // For up swipe, limit to 15rem (240px)
    let translateY = deltaY;
    if (deltaY < 0) {
      // Swipe up - apply resistance and limit to 15rem
      const maxUpSwipe = 240; // 15rem in pixels
      const resistance = 0.6;
      translateY = Math.max(deltaY * resistance, -maxUpSwipe);
    }
    
    toast.style.transform = `translateY(${translateY}px)`;
    
    // Reduce opacity when swiping down
    if (deltaY > 0) {
      const opacity = Math.max(0, 1 - deltaY / 150);
      toast.style.opacity = opacity;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    
    const deltaY = currentY - startY;
    const duration = Date.now() - startTime;
    const velocity = Math.abs(deltaY) / duration;
    
    // Swiped down - dismiss (more lenient threshold)
    if (deltaY > 60 || (deltaY > 20 && velocity > 0.3)) {
      toast.style.transition = "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
      toast.style.transform = "translateY(150px)";
      toast.style.opacity = "0";
      setTimeout(() => {
        removeToast(toast, message, true);
      }, 300);
    }
    // Swiped up - bounce back
    else if (deltaY < -30 || (deltaY < -10 && velocity > 0.5)) {
      toast.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease";
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
      setTimeout(() => {
        toast.style.transition = "";
      }, 400);
    }
    // Small movement - bounce back to original position
    else {
      toast.style.transition = "transform 0.3s ease-out, opacity 0.3s ease";
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
      setTimeout(() => {
        toast.style.transition = "";
      }, 300);
    }
  };

  toast.addEventListener("touchstart", handleTouchStart, { passive: true });
  toast.addEventListener("touchmove", handleTouchMove, { passive: true });
  toast.addEventListener("touchend", handleTouchEnd);
  toast.addEventListener("touchcancel", handleTouchEnd);

  // Mouse drag support for desktop
  let isMouseDragging = false;
  
  const handleMouseDown = (e) => {
    startY = e.clientY;
    currentY = startY;
    startTime = Date.now();
    isMouseDragging = true;
    toast.style.transition = "none";
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isMouseDragging) return;
    
    currentY = e.clientY;
    const deltaY = currentY - startY;
    
    let translateY = deltaY;
    if (deltaY < 0) {
      const maxUpSwipe = 240;
      const resistance = 0.6;
      translateY = Math.max(deltaY * resistance, -maxUpSwipe);
    }
    
    toast.style.transform = `translateY(${translateY}px)`;
    
    if (deltaY > 0) {
      const opacity = Math.max(0, 1 - deltaY / 150);
      toast.style.opacity = opacity;
    }
  };

  const handleMouseUp = () => {
    if (!isMouseDragging) return;
    isMouseDragging = false;
    
    const deltaY = currentY - startY;
    const duration = Date.now() - startTime;
    const velocity = Math.abs(deltaY) / duration;
    
    // Swiped down - dismiss (more lenient threshold)
    if (deltaY > 60 || (deltaY > 20 && velocity > 0.3)) {
      toast.style.transition = "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
      toast.style.transform = "translateY(150px)";
      toast.style.opacity = "0";
      setTimeout(() => {
        removeToast(toast, message, true);
      }, 300);
    }
    // Swiped up - bounce back
    else if (deltaY < -30 || (deltaY < -10 && velocity > 0.5)) {
      toast.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease";
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
      setTimeout(() => {
        toast.style.transition = "";
      }, 400);
    }
    // Small movement - bounce back to original position
    else {
      toast.style.transition = "transform 0.3s ease-out, opacity 0.3s ease";
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
      setTimeout(() => {
        toast.style.transition = "";
      }, 300);
    }
  };

  toast.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  // Trigger animation (slide up from bottom) - use double rAF to ensure initial styles apply on mobile
  const triggerShow = () => toast.classList.add("show");
  // Force a reflow first to flush initial styles
  void toast.offsetHeight;
  if (window.requestAnimationFrame) {
    requestAnimationFrame(() => requestAnimationFrame(triggerShow));
  } else {
    setTimeout(triggerShow, 16);
  }
}

export function removeToast(toastElement, message, skipAnimation = false) {
  // If skipAnimation is true, the toast has already been animated away (e.g., via swipe)
  if (skipAnimation) {
    // Add removing class to trigger repositioning of other toasts
    toastElement.classList.add("removing");
    // Wait a bit for the repositioning animation, then remove from DOM
    setTimeout(() => {
      toastElement.remove();
      activeToasts.delete(message);
    }, 50);
  } else {
    // Clear any inline styles that might interfere with the animation
    toastElement.style.transform = "";
    toastElement.style.opacity = "";
    toastElement.style.transition = "";
    
    toastElement.classList.remove("show");
    toastElement.classList.add("removing");
    
    setTimeout(() => {
      toastElement.remove();
      activeToasts.delete(message);
    }, 300);
  }
}
