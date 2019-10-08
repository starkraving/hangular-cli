#Adding Prototypes

Scaffular has the ability to display and generate templates based on custom markup that you provide.

A sample document, 'template.example', has been provided for you to study and copy. You shouldn't change this file; instead, make a new one named 'template' in this same folder and write your custom template markup there, using the original file as a basis.

When naming your form and link locations, you should make sure that there's one form and one link location named `general`. This is the location that is used by default, and is therefore required.

When you're ready, simply open a terminal in your project's root folder and type `ng generate scaffular:prototype`. This will overwrite the Angular template used by Scaffular in your project so you can see your template as you map out your project, and will also write the properties file needed when you generate your components' template files.

After you've run the prototype command, you'll be able to use your new form and link locations in your project. When you edit the properties of a route, you'll see checkboxes next to each form or exit, for each of the locations you've defined. You can check and uncheck one or more locations for each item. Multiple boxes checked for a single form or exit will result in that one item showing multiple times, one in each of the locations you specify.

Finally, remember that there's a divide in the template between the outer content that is used in the app template, and the inner content that is used in the templates of the individual components. As such, global exits should use only link locations that are on the outside of the inner content contaner (with the attribute `"sc-content"`), and route exits should only use locations that are on the inside. The example template uses `global` as a link location for global exits, and `general` as a link location for route exits.
