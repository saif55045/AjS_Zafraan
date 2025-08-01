document.addEventListener('DOMContentLoaded', function() {

    // Header scroll behavior
    let lastScrollTop = 0;
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            // Downscroll
            header.classList.add('header-hidden');
        } else {
            // Upscroll
            header.classList.remove('header-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });

    // Smooth scroll for category navigation
    const categoryLinks = document.querySelectorAll('.category-nav a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = document.querySelector('.main-header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scrollspy for active category highlighting
    const menuCategories = document.querySelectorAll('.menu-category');
    const navLinks = document.querySelectorAll('.category-nav a');

    window.addEventListener('scroll', () => {
        let current = '';
        menuCategories.forEach(category => {
            const categoryTop = category.offsetTop;
            const categoryHeight = category.clientHeight;
            if (pageYOffset >= (categoryTop - 120)) { // 120 is offset
                current = category.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Browse menu button scroll
    const browseMenuBtn = document.querySelector('.browse-menu-btn');
    if(browseMenuBtn) {
        browseMenuBtn.addEventListener('click', () => {
            document.querySelector('.page-content').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    const menuItems = document.querySelectorAll('.menu-item');

    console.log('Search elements found:', {
        searchInput: !!searchInput,
        menuItems: menuItems.length,
        menuCategories: menuCategories.length
    });

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            console.log('Searching for:', searchTerm);
            
            if (searchTerm === '') {
                // Show all items and categories when search is empty
                menuItems.forEach(item => {
                    item.style.display = 'block';
                });
                menuCategories.forEach(category => {
                    category.style.display = 'block';
                });
                // Remove any existing no results message
                const existingMsg = document.querySelector('.no-results-message');
                if (existingMsg) {
                    existingMsg.remove();
                }
                return;
            }

            // Hide all categories first
            menuCategories.forEach(category => {
                category.style.display = 'none';
            });

            // Search through menu items
            let hasVisibleItems = false;
            menuItems.forEach(item => {
                const titleElement = item.querySelector('h3');
                const descriptionElement = item.querySelector('p');
                
                if (titleElement && descriptionElement) {
                    const itemTitle = titleElement.textContent.toLowerCase();
                    const itemDescription = descriptionElement.textContent.toLowerCase();
                    
                    if (itemTitle.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                        item.style.display = 'block';
                        // Show the parent category
                        const parentCategory = item.closest('.menu-category');
                        if (parentCategory) {
                            parentCategory.style.display = 'block';
                        }
                        hasVisibleItems = true;
                        console.log('Found match:', itemTitle);
                    } else {
                        item.style.display = 'none';
                    }
                }
            });

            console.log('Has visible items:', hasVisibleItems);

            // Handle no results message
            const existingMsg = document.querySelector('.no-results-message');
            if (!hasVisibleItems) {
                if (!existingMsg) {
                    // Create and show no results message
                    const noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'no-results-message';
                    noResultsMsg.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #666;">
                            <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.5;"></i>
                            <h3 style="margin-bottom: 10px;">No dishes found</h3>
                            <p>Try searching with different keywords</p>
                        </div>
                    `;
                    
                    // Insert after allergens link
                    const mainContent = document.querySelector('.main-content');
                    const allergensLink = document.querySelector('.allergens-link');
                    if (allergensLink) {
                        mainContent.insertBefore(noResultsMsg, allergensLink.nextSibling);
                    }
                }
            } else {
                // Remove no results message if it exists
                if (existingMsg) {
                    existingMsg.remove();
                }
            }
        });

        // Clear search on escape key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                this.dispatchEvent(new Event('input'));
            }
        });

        // Add placeholder focus effect
        searchInput.addEventListener('focus', function() {
            console.log('Search input focused');
        });
    } else {
        console.error('Search input not found!');
    }

    // Feedback Modal Functionality
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeModal = document.getElementById('closeModal');
    const feedbackForm = document.getElementById('feedbackForm');
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    // Open modal
    feedbackBtn.addEventListener('click', function() {
        feedbackModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    });

    // Close modal
    function closeFeedbackModal() {
        feedbackModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable background scroll
        resetForm();
    }

    closeModal.addEventListener('click', closeFeedbackModal);

    // Close modal when clicking outside
    feedbackModal.addEventListener('click', function(e) {
        if (e.target === feedbackModal) {
            closeFeedbackModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && feedbackModal.style.display === 'block') {
            closeFeedbackModal();
        }
    });

    // Star rating functionality
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            updateStars();
        });

        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });

    // Reset star highlighting on mouse leave
    document.querySelector('.star-rating').addEventListener('mouseleave', function() {
        updateStars();
    });

    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    function updateStars() {
        stars.forEach((star, index) => {
            if (index < selectedRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Form submission
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Disable submit button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        // Simulate submission delay
        setTimeout(() => {
            // Show success message
            showSuccessMessage();
            
            // Reset form after delay
            setTimeout(() => {
                closeFeedbackModal();
            }, 2000);
        }, 1500);
    });

    function showSuccessMessage() {
        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = `
            <div class="success-message">
                <i class="fa-solid fa-check-circle"></i>
                <h3>Thank you for your feedback!</h3>
                <p>Your feedback has been submitted successfully. We appreciate your input!</p>
            </div>
        `;
    }

    function resetForm() {
        feedbackForm.reset();
        selectedRating = 0;
        updateStars();
        
        // Reset submit button
        const submitBtn = feedbackForm.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
        
        // Reset modal content if it was showing success message
        if (document.querySelector('.success-message')) {
            location.reload(); // Simple way to reset the modal content
        }
    }

});
