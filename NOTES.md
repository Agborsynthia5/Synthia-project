Here are some of the videos i watched:
- https://www.youtube.com/watch?v=qysXVsngmIY&t=1153s
- https://www.youtube.com/watch?v=k5E2AVpwsko&t=3s
- https://www.youtube.com/watch?v=oUmVFHlwZsI&t=1344s
- https://www.youtube.com/watch?v=i7KaVFOXNUQ&t=603s
The first link i was able to learn how to install an angular project since it was my first time hearing about Angular. I was also able to create a folder on angular and also learned how to build a todo app, how it carryout the 4 functions that is CRUD which means C: Create(Adding a task input data). R: Read(Filtering and displaying tasks based on current views). U: Update(Marking a task complete,modifying due dates). D: Delete(Removing a task permanently or moving it to a trash state.
I was also able to learn how to input it task, how to make the date to be not optional, not to be able to add a passed date, add a time and make the app to be browser friendly.
then i was also able to learn typescript in the other link, and why is it more preferable than javascript is because it is easy to debbug,strong typing,object oriented features, get to access some great tooling and lastly catch errors at compile time errors.
Then the third link was about the different between Angular VS React:
We will start with Angular: Angular is a framework , has built-in CLI, has tools and packages included for small medium scale apps.
Then for React: It is a tiny library, doesnot have a CLI, requires you to install additional packages even for a small scale apps.
Then i also learned some of the benefits of Angular:  Less code, faster development, Faster code generation (CLI), code reusability and unit tests ready.

Things that was hard at first was to push to github but with the help of the essentials of github that was given to me by Sir Roy has helped alot .
And also how to make some changes like due date not optional and add time which i used AI to do.

Ticket checklist completed:
- [x] Set up the local Angular development environment and initialize a practice project repo.
- [x] Watch core video modules on Angular CLI, components, and template syntax while coding along.
- [x]  Complete modules on data binding, directives, and services/dependency injection.
- [x] Test and debug the practice application to ensure all hands-on examples run cleanly.
- [x]Document Note.md in the repo and commit the practice code to Git.
- [x]Confirm the app adds, displays, and deletes todos.

- [x]  Confirm the project builds successfully with ng build and no merge conflict markers remain.

Project status:
- Repository: https://github.com/Agborsynthia5/Synthia-project
- Build check: ng build completed successfully.
- Merge conflict check: no <<<<<<< markers remain in any file.

How does filteredTodos decide which tasks to show?:If the view is 'all', it shows every task, if the view is 'active', it shows only tasks where todo.completed is false, if the view is 'completed', it shows only tasks where todo.completed is true, and if the view is 'completed', it shows only tasks where todo.completed is true. So the list on screen automatically updates whenever: A new todo is added, A todo is marked complete/incomplete, and finally when the selected filter changes.

Why does addTodo use [...this.todos, newTodo] instead of this.todos.push(newTodo)?: Its because it creates a new array containing all the existing todos plus newTodo. It doesn’t modify the original array.