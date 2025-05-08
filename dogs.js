document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dogs.html')) {
        const carouselContainer = document.querySelector('.carousel-container');
        const breedButtonsContainer = document.getElementById('breed-buttons-container');
        const dogInfoContainer = document.getElementById('dog-info');
        const breedNameElement = document.getElementById('breed-name');
        const breedDescriptionElement = document.getElementById('breed-description');
        const breedLifeElement = document.getElementById('breed-life');
        const breedWeightElement = document.getElementById('breed-weight');
        const breedHypoallergenicElement = document.getElementById('breed-hypoallergenic');
        let slider;
        let allBreeds = [];

        // Function to fetch all breeds with pagination
        async function fetchAllBreeds(page = 1) {
            try {
                if (page === 1) {
                    breedButtonsContainer.innerHTML = '<p>Loading breeds...</p>';
                    allBreeds = []; // Reset breeds on the first page
                }

                const response = await fetch(`https://dogapi.dog/api/v2/breeds?page[number]=${page}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                if (!data.data) throw new Error('No breed data received');

                allBreeds = allBreeds.concat(data.data);

                if (data.links && data.links.next) {
                    const nextPageUrl = new URL(data.links.next);
                    const nextPageNumber = nextPageUrl.searchParams.get('page[number]');
                    await fetchAllBreeds(parseInt(nextPageNumber));
                } else {
                    createBreedButtons(allBreeds);
                }

            } catch (error) {
                console.error('Error fetching breeds:', error);
                breedButtonsContainer.innerHTML = `
                    <p class="error-message">
                        Could not load dog breeds. Please try again later.
                        <button onclick="window.location.reload()">Retry</button>
                    </p>`;
            }
        }

        // Function to create breed buttons
        function createBreedButtons(breeds) {
            breedButtonsContainer.innerHTML = '';
            breeds.forEach(breed => {
                const button = document.createElement('button');
                button.textContent = breed.attributes.name;
                button.className = 'breed-button custom-button';
                button.addEventListener('click', () => {
                    fetchBreedInfo(breed.id);
                    dogInfoContainer.style.display = 'block';
                });
                breedButtonsContainer.appendChild(button);
            });
        }

        // Fetch random dog images for carousel
        async function fetchRandomDogImages() {
            try {
                carouselContainer.innerHTML = '<p>Loading images...</p>';

                const response = await fetch('https://dog.ceo/api/breeds/image/random/10');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                if (!data.message || !Array.isArray(data.message)) throw new Error('Invalid image data');

                carouselContainer.innerHTML = '';
                data.message.forEach(imgUrl => {
                    const img = document.createElement('img');
                    img.src = imgUrl;
                    img.alt = 'Random dog';
                    img.loading = 'lazy';
                    carouselContainer.appendChild(img);
                });

                if (typeof SimpleSlider !== 'undefined') {
                    slider = new SimpleSlider(carouselContainer);
                }
            } catch (error) {
                console.error('Error fetching images:', error);
                carouselContainer.innerHTML = '<p>Could not load dog images</p>';
            }
        }

        // Fetch breed information
        async function fetchBreedInfo(breedId) {
            try {
                const response = await fetch(`https://dogapi.dog/api/v2/breeds/${breedId}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                if (!data.data?.attributes) throw new Error('Invalid breed data');

                const breed = data.data.attributes;
                breedNameElement.textContent = `Name: ${breed.name}`;
                breedDescriptionElement.textContent = `Description: ${breed.description || 'No description available'}`;
                breedLifeElement.textContent = `Life Span: ${breed.life?.min || '?'}-${breed.life?.max || '?'} years`;
                breedWeightElement.textContent = `Weight: ${breed.male_weight?.min || '?'}-${breed.male_weight?.max || '?'} kg (Male), ${breed.female_weight?.min || '?'}-${breed.female_weight?.max || '?'} kg (Female)`;
                breedHypoallergenicElement.textContent = `Hypoallergenic: ${breed.hypoallergenic ? 'Yes' : 'No'}`;

                await fetchBreedImage(breed.name);
            } catch (error) {
                console.error('Error fetching breed info:', error);
                alert(`Error: ${error.message}`);
            }
        }

        // Fetch breed-specific image
        async function fetchBreedImage(breedName) {
            try {
                const formattedName = breedName.toLowerCase().replace(/ /g, '/');
                const response = await fetch(`https://dog.ceo/api/breed/${formattedName}/images/random`);

                if (!response.ok) throw new Error('No breed-specific image');

                const data = await response.json();
                if (data.message) {
                    carouselContainer.innerHTML = `<img src="${data.message}" alt="${breedName}" loading="lazy">`;
                    if (slider) slider = new SimpleSlider(carouselContainer);
                }
            } catch (error) {
                console.log('Using random image instead');
                fetchRandomDogImages();
            }
        }

        // Initialize Annyang for voice commands
        function initAnnyang() {
            if (typeof annyang !== 'undefined') {
                annyang.addCommands({
                    'load dog breed *breed': (breed) => {
                        const found = allBreeds.find(b =>
                            b.attributes.name.toLowerCase().includes(breed.toLowerCase())
                        );
                        if (found) {
                            fetchBreedInfo(found.id);
                            dogInfoContainer.style.display = 'block';
                        } else {
                            alert(`Breed "${breed}" not found. Try saying the full breed name.`);
                        }
                    }
                });
            }
        }

        // Initialize everything
        fetchAllBreeds();
        fetchRandomDogImages();
        initAnnyang();
    }
});




































