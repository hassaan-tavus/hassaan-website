document.addEventListener('DOMContentLoaded', function() {
    loadInterests().then(setupTooltips);
});

function loadInterests() {
    const interestsContent = document.getElementById('interests-content');
    
    return fetch('interests.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let html = `<h2 class="page-title">INTERESTS</h2>`; // Add the page title here
            html += `<p>${data.introduction}</p>`;
            html += `<p><br>[ <a href="${data.carAdLink}" target="_blank">CLICK HERE</a> ] to watch an obnoxious old car ad that showcases a lot of my interests in a nutshell</p>`;
            
            data.sections.forEach(section => {
                html += `<h2 class="subsection-title">${section.title}</h2>`;
                html += `<p>${section.content}</p>`;
                
                if (section.subsections) {
                    html += '<ul>';
                    section.subsections.forEach(subsection => {
                        html += `<li>
                            <h3 class="subsection-title">${subsection.title}:</h3>
                            <div class="subsection-content">`;
                        if (subsection.title === "Faster, Faster, until the thrill of speed overcomes the fear of death" || subsection.title === "My Love for American Cars") {
                            const shortContent = subsection.content.split(' ').slice(0, 50).join(' ') + '...';
                            html += `
                                <p class="short-content">${shortContent}</p>
                                <p class="full-content" style="display: none;">${subsection.content}</p>
                                <button class="read-more-btn">READ MORE</button>
                            `;
                        } else {
                            html += `<p>${subsection.content}</p>`;
                        }
                        if (subsection.list) {
                            html += '<ul class="car-list">';
                            subsection.list.forEach(item => {
                                const [carName, description] = item.split('|').map(s => s.trim());
                                html += `<li><span class="tooltip">${carName}<span class="tooltiptext">${description}</span></span></li>`;
                            });
                            html += '</ul>';
                        }
                        html += '</div></li>';
                    });
                    html += '</ul>';
                }
            });
            
            interestsContent.innerHTML = html;
            setupReadMoreButtons();
            setupTooltips();
        })
        .catch(error => {
            console.error('Error loading interests:', error);
            interestsContent.innerHTML = 'Error loading interests. Please try again later.';
        });
}

function setupReadMoreButtons() {
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const shortContent = this.previousElementSibling.previousElementSibling;
            const fullContent = this.previousElementSibling;
            
            if (fullContent.style.display === 'none') {
                shortContent.style.display = 'none';
                fullContent.style.display = 'block';
                this.textContent = 'READ LESS';
            } else {
                shortContent.style.display = 'block';
                fullContent.style.display = 'none';
                this.textContent = 'READ MORE';
            }
        });
    });
}

function setupTooltips() {
    const tooltips = document.querySelectorAll('.car-list .tooltip');
    tooltips.forEach(tooltip => {
        const tooltiptext = tooltip.querySelector('.tooltiptext');
        
        // Mouse events
        tooltip.addEventListener('mouseenter', () => {
            tooltiptext.style.visibility = 'visible';
            tooltiptext.style.opacity = '1';
        });
        
        tooltip.addEventListener('mouseleave', () => {
            tooltiptext.style.visibility = 'hidden';
            tooltiptext.style.opacity = '0';
        });
        
        // Touch events
        tooltip.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent the default touch behavior
            tooltiptext.style.visibility = 'visible';
            tooltiptext.style.opacity = '1';
        });
        
        // Close tooltip when touching outside
        document.addEventListener('touchstart', (e) => {
            if (!tooltip.contains(e.target)) {
                tooltiptext.style.visibility = 'hidden';
                tooltiptext.style.opacity = '0';
            }
        });
    });
}

function adjustTooltipPositions() {
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => {
        const tooltiptext = tooltip.querySelector('.tooltiptext');
        tooltip.addEventListener('mouseenter', () => {
            const rect = tooltiptext.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                tooltiptext.style.left = 'auto';
                tooltiptext.style.right = '0';
            }
        });
    });
}

function toggleReadMore(button) {
    const content = button.previousElementSibling;
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        button.textContent = "READ LESS";
    } else {
        content.style.display = "none";
        button.textContent = "READ MORE";
    }
}