import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import isValidDomain from "is-valid-domain";
import {CopyToClipboard} from 'react-copy-to-clipboard';

const styles = {
  container: {
    margin: "0 50px",
    width: 600
  },
  multiline: {
    marginTop: 10,
  },
  chip: {
    margin: "10px 5px"
  },
  switch: {
    margin: 3
  },
  button: {
    width: "49%",
  },
  btnContainer: {
    display: "flex",
    justifyContent: "space-between"
  }
};

function App(props) {
  const [domainName, setDomainName] = useState("");
  const [notionName, setNotionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [slugToPage, setSlugToPage] = useState({});
  const [customRoute, setCustomRoute] = useState("");
  const [customNotionName, setCustomNotionName] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [font, setFont] = useState("");
  const [chipData, setChipData] = useState([]);
  const [saved, setSaved] = useState(false);
  const [checkedRoutes, setCheckedRoutes] = useState(false);
  const [checkedMeta, setCheckedMeta] = useState(false);
  const [copied, setCopy] = useState(false);

  const { classes } = props;
  const code = `/* CONFIGURATION STARTS HERE */

/* Step 1: enter your domain name like fruitionsite.com */
const MY_DOMAIN = ${domainName};

/*
 * Step 2: enter your URL slug to page ID mapping
 * The key on the left is the slug (without the slash)
 * The value on the right is the Notion page ID
 */
const SLUG_TO_PAGE = ${JSON.stringify(slugToPage)}
/* Step 4: enter your Cotter API Key */
const API_KEY = "${apiKey}"
/* Step 3: enter your page title and description for SEO purposes */
const PAGE_TITLE = ${pageTitle};
const PAGE_DESCRIPTION = ${pageDescription}; 

/* Step 4: enter a Google Font name, you can choose from https://fonts.google.com */
const GOOGLE_FONT = ${font};

/* Step 5: enter any custom scripts you'd like */
const CUSTOM_SCRIPT = \`\`;

/* CONFIGURATION ENDS HERE */

const PAGE_TO_SLUG = {};
const slugs = [];
const pages = [];
Object.keys(SLUG_TO_PAGE).forEach(slug => {
  const page = SLUG_TO_PAGE[slug];
  slugs.push(slug);
  pages.push(page);
  PAGE_TO_SLUG[page] = slug;
});

addEventListener('fetch', event => {
  event.respondWith(fetchAndApply(event.request));
});

function generateSitemap() {
  let sitemap = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  slugs.forEach(
    (slug) =>
      (sitemap +=
        '<url><loc>https://' + MY_DOMAIN + '/' + slug + '</loc></url>')
  );
  sitemap += '</urlset>';
  return sitemap;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function handleOptions(request) {
  if (request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: corsHeaders
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        'Allow': 'GET, HEAD, POST, PUT, OPTIONS',
      }
    });
  }
}

const html = \`<!DOCTYPE html>
  <head>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;900&display=swap" rel="stylesheet">
    <script
      src="https://unpkg.com/cotter@0.3.31/dist/cotter.loader.js"
      type="text/javascript"
      data-cotter-api-key-id="\${API_KEY}"
    ></script>
    <style>
      html, body {
        height: 100vh;
        margin: 0; 
        padding: 0;
        font-family: 'Lato', sans-serif;
      }
      #cotter-form-container-form_default {
        width: 300px;
        height: 300px;
        margin: auto;
      }
      #login-title {
        margin-top: 50px;
        margin-bottom: 0;
        text-align: center;
        font-weight: 900;
        font-size: 2.3rem;
        letter-spacing: 0.1rem;
      }
      a {
        margin-left: 40px; 
        margin-top: 25px;
        text-decoration: none;
        display: flex;
        color: black;
        font-weight: 300;
      }
    </style>
  </head>
  <body>
      <a href="/">Back</a>
      <h1 id="login-title">Login</h1>
      <div id="cotter-form-container-form_default"></div>
  </body>\`
  ;

async function handleRequestLogin(request) {
  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8"
    }
  });
}

async function fetchAndApply(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }
  let url = new URL(request.url);
  url.hostname = 'www.notion.so';
  if (url.pathname === '/robots.txt') {
    return new Response('Sitemap: https://' + MY_DOMAIN + '/sitemap.xml');
  }
  if (url.pathname === '/sitemap.xml') {
    let response = new Response(generateSitemap());
    response.headers.set('content-type', 'application/xml');
    return response;
  }
  let fullPathname = request.url.replace("https://" + MY_DOMAIN, "");
  let response;
  if (url.pathname.startsWith('/app') && url.pathname.endsWith('js')) {
    response = await fetch(url.toString());
    let body = await response.text();
    response = new Response(body.replace(/www.notion.so/g, MY_DOMAIN).replace(/notion.so/g, MY_DOMAIN), response);
    response.headers.set('Content-Type', 'application/x-javascript');
    return response;
  } else if ((url.pathname.startsWith('/api'))) {
    // Forward API
    response = await fetch(url.toString(), {
      body: request.body,
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36'
      },
      method: 'POST',
    });
    response = new Response(response.body, response);
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } else if (slugs.indexOf(url.pathname.slice(1)) > -1) {
    const pageId = SLUG_TO_PAGE[url.pathname.slice(1)];
    return Response.redirect('https://' + MY_DOMAIN + '/' + pageId, 301);
  } else if (url.pathname.endsWith('/login')) {
    return handleRequestLogin(request)
  } else {
    response = await fetch(url.toString(), {
      body: request.body,
      headers: request.headers,
      method: request.method,
    });
    response = new Response(response.body, response);
    response.headers.delete('Content-Security-Policy');
    response.headers.delete('X-Content-Security-Policy');
  }

  return appendJavascript(response, SLUG_TO_PAGE);
}

class MetaRewriter {
  element(element) {
    if (PAGE_TITLE !== '') {
      if (element.getAttribute('property') === 'og:title'
        || element.getAttribute('name') === 'twitter:title') {
        element.setAttribute('content', PAGE_TITLE);
      }
      if (element.tagName === 'title') {
        element.setInnerContent(PAGE_TITLE);
      }
    }
    if (PAGE_DESCRIPTION !== '') {
      if (element.getAttribute('name') === 'description'
        || element.getAttribute('property') === 'og:description'
        || element.getAttribute('name') === 'twitter:description') {
        element.setAttribute('content', PAGE_DESCRIPTION);
      }
    }
    if (element.getAttribute('property') === 'og:url'
      || element.getAttribute('name') === 'twitter:url') {
      element.setAttribute('content', MY_DOMAIN);
    }
    if (element.getAttribute('name') === 'apple-itunes-app') {
      element.remove();
    }
  }
}

class HeadRewriter {
  element(element) {
    if (GOOGLE_FONT !== '') {
      element.append(\`<link href="https://fonts.googleapis.com/css?family=\${GOOGLE_FONT.replace(
        " ",
        "+"
      )}:Regular,Bold,Italic&display=swap" rel="stylesheet">
      <style>* { font-family: "\${GOOGLE_FONT}" !important; }</style>\`, {
       html: true
      });
    }
    element.append(\`<style>
    div.notion-topbar > div > div:nth-child(3) { display: none !important; }
    div.notion-topbar > div > div:nth-child(4) { display: none !important; }
    div.notion-topbar > div > div:nth-child(5) { display: none !important; }
    div.notion-topbar > div > div:nth-child(6) { display: none !important; }
    div.notion-topbar-mobile > div:nth-child(3) { display: none !important; }
    div.notion-topbar-mobile > div:nth-child(4) { display: none !important; }
    div.notion-topbar > div > div:nth-child(1n).toggle-mode { display: block !important; }
    div.notion-topbar-mobile > div:nth-child(1n).toggle-mode { display: block !important; }
    </style>\`, {
      html: true
    })
  }
}

class BodyRewriter {
  constructor(SLUG_TO_PAGE) {
    this.SLUG_TO_PAGE = SLUG_TO_PAGE;
  }
  element(element) {
    element.append(\`<div style="display:none">Powered by <a href="http://fruitionsite.com">Fruition</a></div>
    <script
      src="https://unpkg.com/cotter@0.3.31/dist/cotter.loader.js"
      type="text/javascript"
      data-cotter-api-key-id="\${API_KEY}"
    ></script>
    <script>
    var cotter = new Cotter("\${API_KEY}");
    let isLoggedIn = false
    async function checkLogin() {
      const accessTokenObject = await cotter.tokenHandler.getAccessToken();
      const accessToken = accessTokenObject ? accessTokenObject.token : null;
      if (accessToken) isLoggedIn = true
    }
    checkLogin();

    const SLUG_TO_PAGE = \${JSON.stringify(this.SLUG_TO_PAGE)};
    const PAGE_TO_SLUG = {};
    const slugs = [];
    const pages = [];
    const el = document.createElement('div');
    let redirected = false;
    Object.keys(SLUG_TO_PAGE).forEach(slug => {
      const page = SLUG_TO_PAGE[slug];
      slugs.push(slug);
      pages.push(page);
      PAGE_TO_SLUG[page] = slug;
    });
    function getPage() {
      return location.pathname.slice(-32);
    }
    function getSlug() {
      return location.pathname.slice(1);
    }
    function updateSlug() {
      const slug = PAGE_TO_SLUG[getPage()];
      if (slug != null) {
        history.replaceState(history.state, '', '/' + slug);
      }
    }
    function onDark() {
      el.innerHTML = '<div style="margin-left: auto; margin-right: 14px; min-width: 0px;"><div role="button" tabindex="0" style="user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; border-radius: 44px;"><div style="display: flex; flex-shrink: 0; height: 14px; width: 26px; border-radius: 44px; padding: 2px; box-sizing: content-box; background: rgb(46, 170, 220); transition: background 200ms ease 0s, box-shadow 200ms ease 0s;"><div style="width: 14px; height: 14px; border-radius: 44px; background: white; transition: transform 200ms ease-out 0s, background 200ms ease-out 0s; transform: translateX(12px) translateY(0px);"></div></div></div></div>';
      document.body.classList.add('dark');
      __console.environment.ThemeStore.setState({ mode: 'dark' });
    };
    function onLight() {
      el.innerHTML = '<div style="margin-left: auto; margin-right: 14px; min-width: 0px;"><div role="button" tabindex="0" style="user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; border-radius: 44px;"><div style="display: flex; flex-shrink: 0; height: 14px; width: 26px; border-radius: 44px; padding: 2px; box-sizing: content-box; background: rgba(135, 131, 120, 0.3); transition: background 200ms ease 0s, box-shadow 200ms ease 0s;"><div style="width: 14px; height: 14px; border-radius: 44px; background: white; transition: transform 200ms ease-out 0s, background 200ms ease-out 0s; transform: translateX(0px) translateY(0px);"></div></div></div></div>';
      document.body.classList.remove('dark');
      __console.environment.ThemeStore.setState({ mode: 'light' });
    }
    function toggle() {
      if (document.body.classList.contains('dark')) {
        onLight();
      } else {
        onDark();
      }
    }
    function addDarkModeButton(device) {
      const nav = device === 'web' ? document.querySelector('.notion-topbar').firstChild : document.querySelector('.notion-topbar-mobile');
      el.className = 'toggle-mode';
      el.addEventListener('click', toggle);
      nav.appendChild(el);
      onLight();
    }
    function addLoginButton(device) {
      const nav = device === 'web' ? document.querySelector('.notion-topbar').firstChild : document.querySelector('.notion-topbar-mobile');
      let loginButton = document.createElement('div')
      loginButton.className = 'login-button';
      loginButton.innerHTML = '<div style="margin-right: 20px"><a href="/login" style="text-decoration: none; color: black;">Login</a></div>'
      nav.appendChild(loginButton);
    }
    function addLogoutButton(device) {
      const nav = device === 'web' ? document.querySelector('.notion-topbar').firstChild : document.querySelector('.notion-topbar-mobile');
      let logoutButton = document.createElement('div')
      logoutButton.innerHTML = '<div style="margin-right: 20px"><a style="text-decoration: none; color: black;">Logout</a></div>'
      logoutButton.addEventListener("click", async () => {
        await cotter.logOut();
        window.location.href = "/"; // Redirect to home	      
      })
      nav.appendChild(logoutButton);
    }

    const observer = new MutationObserver(function() {
      if (redirected) return;
      const nav = document.querySelector('.notion-topbar');
      const mobileNav = document.querySelector('.notion-topbar-mobile');
      if (nav && nav.firstChild && nav.firstChild.firstChild
        || mobileNav && mobileNav.firstChild) {
        redirected = true;
        updateSlug();
        addDarkModeButton(nav ? 'web' : 'mobile');
        if(!isLoggedIn) {
          addLoginButton(nav ? 'web' : 'mobile');
        } else {
          addLogoutButton(nav ? 'web' : 'mobile');
        }
        const onpopstate = window.onpopstate;
        window.onpopstate = function() {
          if (slugs.includes(getSlug())) {
            const page = SLUG_TO_PAGE[getSlug()];
            if (page) {
              history.replaceState(history.state, 'bypass', '/' + page);
            }
          }
          onpopstate.apply(this, [].slice.call(arguments));
          updateSlug();
        };
      }
    });
    observer.observe(document.querySelector('#notion-app'), {
      childList: true,
      subtree: true,
    });
    const replaceState = window.history.replaceState;
    window.history.replaceState = function(state) {
      if (arguments[1] !== 'bypass' && slugs.includes(getSlug())) return;
      return replaceState.apply(window.history, arguments);
    };
    const pushState = window.history.pushState;
    window.history.pushState = function(state) {
      const dest = new URL(location.protocol + location.host + arguments[2]);
      const id = dest.pathname.slice(-32);
      if (pages.includes(id)) {
        arguments[2] = '/' + PAGE_TO_SLUG[id];
        window.location.replace(arguments[2]);
      }
      return pushState.apply(window.history, arguments);
    };
    const open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function() {
      arguments[1] = arguments[1].replace('\${MY_DOMAIN}', 'www.notion.so');
      return open.apply(this, [].slice.call(arguments));
    };
  </script>\${CUSTOM_SCRIPT}\`, {
      html: true
    });
  }
}

async function appendJavascript(res, SLUG_TO_PAGE) {
  return new HTMLRewriter()
    .on('title', new MetaRewriter())
    .on('meta', new MetaRewriter())
    .on('head', new HeadRewriter())
    .on('body', new BodyRewriter(SLUG_TO_PAGE))
    .transform(res);
}\`)`;

  const handleSubmit = () => { };

  const updateSlugToPage = (slug, page) => {
    let pageId;
    if (page.includes("?v=")) {
      pageId = page.split("?")[0];
      pageId = pageId.split(".so/")[1];
    } else if (page.slice(-33)[0] === "-") {
      pageId = page.slice(-32);
    } else {
      pageId = "undefined"
    }
    let currentSlugToPage = {...slugToPage};
    currentSlugToPage[slug] = pageId;
    setSlugToPage(currentSlugToPage);
  };

  const handleDomainChange = (evt) => {
    setDomainName(evt.target.value);
  };

  const handleFontChange = (evt) => {
    setFont(evt.target.value);
  };

  const handleTitleChange = (evt) => {
    setPageTitle(evt.target.value);
  };

  const handleDescriptionChange = (evt) => {
    setPageDescription(evt.target.value);
  };

  const handleNotionChange = (evt) => {
    setNotionName(evt.target.value);
    updateSlugToPage("", evt.target.value)
  };

  const handleApiChange = (evt) => {
    setApiKey(evt.target.value);
  };


  const handleCustomRouteChange = (evt) => {
    setCustomRoute(evt.target.value);
    setSaved(false);
  };

  const handleCustomNotionChange = (evt) => {
    setCustomNotionName(evt.target.value);
    setSaved(false);
  };

  const clear = () => {
    setCustomRoute("");
    setCustomNotionName("");
    setSaved(false);
  };

  const handleCustomSubmit = () => {
    updateSlugToPage(customRoute, customNotionName);
    createChip();
    setSaved(true);
  };

  const handleSwitchRoutes = () => {
    setCheckedRoutes(!checkedRoutes);
  }

  const handleSwitchMeta = () => {
    setCheckedMeta(!checkedMeta);
  }

  const createChip = () => {
    let chipObj = {
      key: chipData.length,
      label: customRoute
    }
    setChipData(chipData => [...chipData, chipObj]);
  }

  const handleDelete = (chipToDelete) => () => {
    let deletedChips = chipData.filter(c => c.key !== chipToDelete.key);
    setChipData(deletedChips);
    let currentSlugToPage = {...slugToPage};
    console.log(currentSlugToPage)
    let label = chipToDelete.label
    console.log(label)
    delete currentSlugToPage[label]
    console.log(currentSlugToPage)
    setSlugToPage(currentSlugToPage);
    setSaved(false);
  }

  useEffect(() => {
    ValidatorForm.addValidationRule("isDomain", (value) => {
      return isValidDomain(value);
    });

    ValidatorForm.addValidationRule("isNotion", (value) => {
      return value.startsWith("https://www.notion.so/");
    });

    ValidatorForm.addValidationRule("isApi", (value) => {
      return (
        value &&
        value.length > 5 &&
        value.match(
          /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
        )
      );
    });



    ValidatorForm.addValidationRule("isAlpha", (value) => {
      return /^[a-z]+$/.test(value);
    });
  }, []);

  return (
    <div className={classes.container}>
      <ValidatorForm onSubmit={handleSubmit} instantValidate={true}>
        <TextValidator
          value={domainName}
          variant="outlined"
          label="Domain Name"
          placeholder="example.com"
          fullWidth
          margin="normal"
          onChange={handleDomainChange}
          validators={["isDomain"]}
          errorMessages={["Please enter a valid domain"]}
          required
        />
      </ValidatorForm>
      <ValidatorForm onSubmit={handleSubmit} instantValidate={true}>
        <TextValidator
          value={apiKey}
          variant="outlined"
          fullWidth
          label="Cotter API Key"
          margin="normal"
          onChange={handleApiChange}
          validators={["isApi"]}
          errorMessages={["Please enter a valid Cotter API Key"]}
          required
        />
      </ValidatorForm>
      <ValidatorForm onSubmit={handleSubmit} instantValidate={true}>
        <TextValidator
          value={notionName}
          variant="outlined"
          fullWidth
          label="Notion Homepage Link"
          placeholder="https://www.notion.so/..."
          margin="normal"
          onChange={handleNotionChange}
          validators={["isNotion"]}
          errorMessages={["Please enter a valid notion domain"]}
          required
        />
      </ValidatorForm>

      {/* Switch */}
      <FormControlLabel
        control={
          <Switch
            checked={checkedMeta}
            onChange={handleSwitchMeta}
            color="secondary"
            className={classes.switch}
          />
        }
        label="Metadata"
      />
      
      {checkedMeta && <ValidatorForm onSubmit={handleSubmit} instantValidate={true}>
        <TextValidator
          value={pageTitle}
          variant="outlined"
          fullWidth
          label="Page Title"
          margin="normal"
          onChange={handleTitleChange}
        />
        <TextValidator
          value={pageDescription}
          variant="outlined"
          fullWidth
          label="Page Description"
          margin="normal"
          onChange={handleDescriptionChange}
        />
        <TextValidator
          value={font}
          variant="outlined"
          fullWidth
          label="Google Font Name"
          margin="normal"
          placeholder="Roboto"
          onChange={handleFontChange}
        />
      </ValidatorForm>}

      <FormControlLabel
        control={
          <Switch
            checked={checkedRoutes}
            onChange={handleSwitchRoutes}
            color="primary"
            className={classes.switch}
          />
        }
        label="Custom Routes"
      />

      {checkedRoutes && <ValidatorForm onSubmit={handleCustomSubmit} instantValidate={false}>
        <TextValidator
          value={customRoute}
          variant="filled"
          label="Custom Route"
          margin="normal"
          placeholder="about"
          validators={["isAlpha"]}
          errorMessages={[
            "Route has to be in lowercase alphabet",
          ]}
          InputProps={{
            startAdornment:<InputAdornment position="start">{domainName + "/"}</InputAdornment>,
          }}
          onChange={handleCustomRouteChange}
          variant="outlined"
          fullWidth
          required
          //className={classes.input}
        />
        <TextValidator
          value={customNotionName}
          variant="outlined"
          label="Custom Page - Notion Link"
          placeholder="https://www.notion.so/..."
          margin="normal"
          onChange={handleCustomNotionChange}
          validators={["isNotion"]}
          errorMessages={["Please enter a valid notion domain"]}
          required
          fullWidth
          //className={classes.colorNameInput}
        />
        <div className={classes.btnContainer}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={saved}
            className={classes.button}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={clear}
            className={classes.button}
          >
            Clear
          </Button>
        </div>
      </ValidatorForm>}

      {/* Chips */}
      <div>
        {chipData.map((chip) => (
          <Chip 
            key={chip.key}
            label={chip.label}
            onDelete={handleDelete(chip)}
            className={classes.chip}
            variant="outlined"
            color="primary"
          /> 
        ))}
      </div>

      <TextField
        label="Code - Copy to Clipboard"
        fullWidth
        multiline
        rows={7}
        value={code}
        variant="outlined"
        className={classes.multiline}
      />
      <CopyToClipboard text={code}
        onCopy={() => setCopy(true)}>
        <Button
          variant="contained"
          color="primary"
          onClick={clear}
          fullWidth
        >
          Copy
        </Button>
      </CopyToClipboard>
      
    </div>
  );
}

export default withStyles(styles)(App);



