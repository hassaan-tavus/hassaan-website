document.addEventListener('DOMContentLoaded', function() {
    loadInterests();
});

function loadInterests() {
    const interestsContent = document.getElementById('interests-content');
    
    fetch('interests.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let html = `<p>${data.introduction}</p>`;
            html += `<p><br>[ <a href="${data.carAdLink}" target="_blank">CLICK HERE</a> ] to watch an obnoxious old car ad that showcases a lot of my interests in a nutshell</p>`;
            
            data.sections.forEach(section => {
                html += `<h3>${section.title}</h3>`;
                html += `<p>${section.content}</p>`;
                
                if (section.subsections) {
                    html += '<ul>';
                    section.subsections.forEach(subsection => {
                        html += `<li><strong>${subsection.title}:</strong>`;
                        if (subsection.title === "My Love for American Cars") {
                            const shortContent = subsection.content.split(' ').slice(0, 50).join(' ') + '...';
                            html += `
                                <p class="short-content">${shortContent}</p>
                                <p class="full-content" style="display: none;">${subsection.content}</p>
                                <p class="read-more-btn">[ READ MORE ]</p>
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
                        html += '</li>';
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
                this.textContent = '[ READ LESS ]';
            } else {
                shortContent.style.display = 'block';
                fullContent.style.display = 'none';
                this.textContent = '[ READ MORE ]';
            }
        });
    });
}

function setupTooltips() {
    const tooltips = document.querySelectorAll('.car-list .tooltip');
    tooltips.forEach(tooltip => {
        const tooltiptext = tooltip.querySelector('.tooltiptext');
        tooltip.style.display = 'inline';
        tooltip.style.borderBottom = '1px dotted #0f0';
        tooltiptext.style.display = 'none';
        
        tooltip.addEventListener('mouseenter', () => {
            tooltiptext.style.display = 'block';
        });
        
        tooltip.addEventListener('mouseleave', () => {
            tooltiptext.style.display = 'none';
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