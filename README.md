# Scaffular - Angular Scaffolding

### This software was designed to save you development time and money
Did it help? Consider donating some of your savings towards further enhancements to the software!

[![patreon](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/bePatron?u=26073031)

### Summary

One of the toughest hurdles faced by Angular application developers is the "white screen of death"; it happens when you're just starting the project and haven't mapped it out fully --- or at all. Scaffular helps by giving you a browser-based interface to scope out the project's routes, including forms and form fields, links that will be visible on that route's screen, and links that will be visible on all screens. This has the added benefit of allowing you to preview the project with stakeholders before development starts in earnest, providing them with a fast and interactive way to give feedback when it's most critical.

When you're satisfied that you have the project mapped out, a single `ng generate` command will register all your routes in app-router.module, register your components with app.module, update the outer app template with your defined global links, and generate component files and template files for each route, including route parameters, and reactive forms with all your fields. You can then `ng serve` the project and continue developing as you would normally.

### Getting Started

This tool uses the angular-cli command line tool, so you'll need to have it installed:
```
> npm i @angular/cli
```
Then go to the folder where you want your project created and type:
```
> ng new projectname
```
(Replace "projectname" with the actual name of your project)

Then move into the new project folder and add the scaffular planning UI:
```
> cd projectname
> ng add scaffular
```
You can then run `ng serve --open` to run the dev environment and load the page in your browser.

### Using the Planning Interface

#### Viewing the details of a defined route

When you're viewing a route that's been defined, you'll see the route address, a short description (if supplied), any forms with clickable submit buttons, any clickable exit links that are specific to that page, and any clickable exit links that are global to the entire application. You'll also see on the right hand side a set of buttons that let you edit the current route, export a copy of the project map in its current state, or reset the project map back to its defaults.

Clicking on one of the form buttons will show you a short description of what should take place when this form is submitted, along with a button to click on that will either navigate you to a new route, or take you back to the main view for the current one. You'll also see on the right hand side a button you can use to edit the current form.

Clicking on one of the page-specific exits or one of the global exits will either show you the details of the new route if it's defined, or show you the properties form if it's not.

#### Editing the properties of a route

The properties form for a route looks and acts the same for either editing an existing route or defining a new one. There's a text box to set the description of the route, a set of fields to define any forms, and then another set of fields to define any exit links.

When defining a form, you need to specify the button text as well as the name of the action that will happen when the form is submitted. The action name should be a string that is useable as a function name, such as "doNewsletterSignup". There's currently no validation for the field, so putting any other kind of text will most likely result in your project not compiling. The rows for defining forms will expand when you start typing on the last row, so you'll always be able to specify as many forms as needed. When editing a form, you can convert it to an exit or global exit by changing the value in the dropdown -- make sure you change the value of a form action to a route as well as changing the dropdown.

When defining an exit, use the dropdown to specify either global or route-specific, then specify the visible text for the link, and the route the user should be sent to after clicking. If you're editing a link, you can convert it to a global exit or a form by changing the value of the dropdown -- make sure you change the value of the route to a form action if you're changing a link to a form. 

Hit the save button to save your changes and return to the details screen for the current route.

#### Editing the properties of a form

You can edit the forms of any route that's been defined by clicking on the form's submit button, and then clicking the edit button on the right hand side of the screen. You'll see a space you can use to explain what should happen when the user submits the form, as well as a space to enter the properties for one or more form fields.

Use the dropdown to specify the field's input type. You can also define a text label for the field, and a default value as well. For "select" type inputs, use commas in the value to generate the individual options in the select box. For example a select box with a label of "Country" might have a value of "USA,Canada,Etc,Etc". For "radio" or "checkbox" inputs, a comma-separated value will be used to generate the individual radio buttons or check boxes, with the label text for each option. When you start typing in the last row of fields, a new row will automatically be added so you should always have enough for your form.

There's also a field you can use to specify the route that the user should be navigated to after the actions of the form have been performed. Leave this field blank if you want the user to stay on the current route.

Hit the save button to save your changes and return the the details screen for the current form.

#### Exporting the Project Map

There's currently no mechanism by which the project map's JSON file can be updated automatically, so use the export button to download a copy of the file in its current state. You'll then need to use your computer's file manager to copy or move the file over top of the project map within your project. The map file is found at `src/app/scaffular/model/project.json`. Overwriting this file will automatically update the project the next time the page is refreshed in the browser. Note: these instructions are written assuming the development is happening on your local machine. You would need to use other file transfer methods if you were working remotely.

### Generating the Scaffolded Files

When you've completely defined the project's scope and are happy with everything, and you've saved over the project's JSON file with the exported file, you can quit the application by hitting Ctrl C in the command line. You'll then be able to type the following command:
```
> ng generate scaffular:ng-generate
```

This will update the existing app configurations to register your routes and components, and will automatically generate a component file and template for each of your routes. You should then simply need to `ng serve` to see your changes.

### Upcoming Enhancements

Development of Scaffular is ongoing, with some enhancements planned in the future. They include:

* A "preflight" screen that will let you look at the generator output of the project and alter some of the properties before running the generator
* A Node-based micro-service that will automatically save changes to your project map as you author, so you don't have to export it manually
