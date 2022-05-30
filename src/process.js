export async function load(ipcRenderer, rawUrl) {
  const ipcPromise = ipcRenderer.invoke('request', rawUrl);
  let url = new URL(rawUrl);
  const result = await ipcPromise;

  switch(url.protocol) {
    case 'http:':
    case 'https:': {
      return handleHttp(result);
    }
    case 'browser:': {
      return handleBrowser(result);
    }
  }
}

function handleBrowser(result) {
  return result.content;
}

function handleHttp(result) {
  let html = result.content;
  let template = document.createElement('template');
  template.innerHTML = html;
  const ldjsonscript = template.content.querySelector('script[type="application/ld+json"]');
  if(ldjsonscript) {
    let ldjson = JSON.parse(ldjsonscript.textContent);
    let recipe = ldjson['@graph'].find(obj => obj['@type'] === 'Recipe');
    let { title, html } = recipeTemplate(recipe);
    template.innerHTML = html;
    document.title = title;
  } else {
    // Sanitize regular page
    for(let el of template.content.querySelectorAll('script, link, style')) {
      el.remove();
    }
  }

  return template.innerHTML;

  //frame.setAttribute('srcdoc', template.innerHTML);
}

function recipeTemplate(recipe) {
  let html = `
    <article>
      <header><h1>${recipe.name}</h1>

      <figure>
        <img src="${recipe.image[0]}" alt="${recipe.name}" />
      </figure>
    
      <section class="ingredients">
        <h2>Ingredients</h2>
        <ol>
          ${recipe.recipeIngredient.map(ing => `
            <li>${ing}</li>
          `).join('')}
        </ol>
      </section>

      <section class="instructions">
        <h2>Instructions</h2>
        <ol>
          ${recipe.recipeInstructions.map(instr => `
            <li>${instr.text}</li>
          `).join('')}
        </ol>
      </section>
    </article>
  `;

  return {
    title: recipe.name,
    html
  };
}