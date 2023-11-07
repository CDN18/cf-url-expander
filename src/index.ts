/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 20px;
      line-height: 1.5;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    #form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1em;
      margin-bottom: 1em;
    }
    #form input[type="text"] {
      font-size: 20px;
      padding: 0.5em;
      width: 100%;
      max-width: 300px;
    }
    #result {
      font-size: 20px;
      padding: 0.5em;
      width: 100%;
      max-width: 300px;
      word-wrap: break-word;
	  display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #000;
      height: 50px;
      overflow: auto;
	  display: none;
    }
    #copy {
      margin-top: 1em;
      display: none;
    }
    @media (max-width: 600px) {
      body {
        font-size: 20px;
      }
      #form input[type="text"] {
        font-size: 20px;
      }
      #result {
        font-size: 20px;
      }
    }
	#form label {
      font-size: 24px;
    }
    #form input[type="submit"], #copy {
      font-size: 20px;
      padding: 0.5em;
    }
	#form input[type="text"], #result {
		max-width: 500px;
	}
  </style>
</head>
<body>
  <form id="form">
    <label for="url">Short URL:</label><br>
    <input type="text" id="url" name="url"><br>
    <input type="submit" value="Expand">
  </form>
  <p id="result"></p>
  <button id="copy" style="display: none;">Copy</button>
  <script>
    document.getElementById('form').addEventListener('submit', function(event) {
      event.preventDefault();
      const url = document.getElementById('url').value;
      fetch('/', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'url=' + encodeURIComponent(url)
      })
      .then(response => response.text())
      .then(text => {
        const resultElement = document.getElementById('result');
		resultElement.textContent = text;
		resultElement.style.display = 'flex';
		document.getElementById('copy').style.display = 'block';
      });
    });
    document.getElementById('copy').addEventListener('click', function() {
      navigator.clipboard.writeText(document.getElementById('result').textContent);
    });
  </script>
</body>
</html>
`;

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'GET') {
      return new Response(html, {headers: {'content-type': 'text/html'}});
    } else if (request.method === 'POST') {
      const formData = await request.formData();
      const url = formData.get('url');
      const response = await fetch(url as string, {redirect: 'manual'});
      if (response.status >= 300 && response.status <= 399) {
        const location = response.headers.get('location');
        return new Response(location, {headers: {'content-type': 'text/plain'}});
      } else {
        return new Response('No redirect found', {status: 404});
      }
    }
  },
};
