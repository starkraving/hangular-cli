---


---

<h1 id="scaffular---angular-scaffolding">Scaffular - Angular Scaffolding</h1>
<h3 id="this-software-was-designed-to-save-you-development-time-and-money">This software was designed to save you development time and money</h3>
<p>Did it help? Consider donating some of your savings towards further enhancements to the software!<br>
<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&amp;hosted_button_id=QZVW63UBEBQYU&amp;source=url"><img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" alt="paypal"></a></p>
<h3 id="summary">Summary</h3>
<p>One of the toughest hurdles faced by Angular application developers is the “white screen of death”; it happens when you’re just starting the project and haven’t mapped it out fully — or at all. Scaffular helps by giving you a browser-based interface to scope out the project’s routes, including forms and form fields, links that will be visible on that route’s screen, and links that will be visible on all screens. This has the added benefit of allowing you to preview the project with stakeholders before development starts in earnest, providing them a fast and interactive way to provide feedback when it’s most critical.</p>
<p>When you’re satisfied that you have the project mapped out, a single <code>ng generate</code> command will register all your routes in app-router.module, register your components with app.module, update the outer app template with your defined global links, and generate component files and template files for each route, including route parameters, and reactive forms with all your fields. You can then <code>ng serve</code> the project and continue developing as you would normally.</p>
<h3 id="getting-started">Getting Started</h3>
<p>This tool uses the angular-cli command line tool, so you’ll need to have it installed:</p>
<pre><code>&gt; npm i @angular/cli
</code></pre>
<p>Then go to the folder where you want your project created and type:</p>
<pre><code>&gt; ng new projectname
</code></pre>
<p>(Replace “projectname” with the actual name of your project)</p>
<p>Then move into the new project folder and add the scaffular planning UI:</p>
<pre><code>&gt; cd projectname
&gt; ng add scaffular
</code></pre>
<p>You can then run <code>ng serve --open</code> to run the dev environment and load the page in your browser.</p>
<h3 id="using-the-planning-interface">Using the Planning Interface</h3>

