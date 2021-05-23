import {IInputs, IOutputs} from "./generated/ManifestTypes";
import Swal from "sweetalert2";
//Credit: https://sweetalert2.github.io/

export class Todo implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	/**
	 * Global Variables
	 */ 

	private mainDiv : HTMLDivElement;
	private formDiv : HTMLFormElement;
	private inputForm : HTMLInputElement;
	private buttonForm : HTMLButtonElement;
	private todoContainerDiv : HTMLDivElement;
	private todoList : HTMLUListElement;
	private outputLabel: HTMLLabelElement;;

	private NOtifyOutputChanged : () => void;
	private maxCharLimit : number;
	
	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this.NOtifyOutputChanged = notifyOutputChanged;

		this.maxCharLimit = context.parameters.maxCharacterCounterLimit.raw || 0;

		this.mainDiv = document.createElement("div");

		//Form
		this.formDiv = document.createElement("form");
		this.inputForm = document.createElement("input");
		this.inputForm.placeholder = "Inserisci un Nome"
		this.inputForm.classList.add("todo-input");
		this.buttonForm = document.createElement("button");
		this.buttonForm.innerHTML ="<i class='fas fa-plus-square'></i>"
		this.buttonForm.classList.add("todo-button");

		//Output Label
		this.outputLabel = document.createElement("label");
		this.outputLabel.classList.add("labelChar");

		//Todo Container
		this.todoContainerDiv = document.createElement("div");
		this.todoList = document.createElement("ul");
		this.todoContainerDiv = document.createElement("div");
		this.todoContainerDiv.classList.add("todo-container");
		this.todoList = document.createElement("ul");
		this.todoList.classList.add("todo-list");		

		//Event Listner
		this.buttonForm.addEventListener("click",(click) => {this.addTodo(click)})
		this.todoList.addEventListener("click", (click)=>{this.todoDeleteCheck(click)})
		this.inputForm.addEventListener("change",this.onChange.bind(this));

		//Tree
		this.formDiv.appendChild(this.inputForm);
		this.formDiv.appendChild(this.buttonForm);		
		this.mainDiv.appendChild(this.formDiv);
		this.mainDiv.appendChild(this.outputLabel);
		this.mainDiv.appendChild(this.todoContainerDiv);


		container.appendChild(this.mainDiv);

		this.onChange();
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		const changedCharCounterLimit = context.parameters.maxCharacterCounterLimit.raw || 0;
		if(this.maxCharLimit != changedCharCounterLimit){
			this.maxCharLimit = changedCharCounterLimit;
			this.onChange;
		}
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			maxCharacterCounterLimit : this.inputForm.value
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

	/******************
	 * 
	 * PRIVATE FUNCTION
	 * 
	******************/

	public addTodo(event:Event) : void {	
		// Prevent form for submitting
		event.preventDefault();	
		if(this.inputForm.value === ""){
			Swal.fire("Todo Non Valido", "Il campo Nome non può essere vuoto", "error");
		}
		else{
			//Todo Div
			const todoDiv = document.createElement("div");
			todoDiv.classList.add("todo");
			//Create Li
			const newTodo = document.createElement("li");
			newTodo.innerText = this.inputForm.value;
			newTodo.classList.add("todo-item");
			todoDiv.appendChild(newTodo);
			//Check Mark Button
			const completedButton = document.createElement("button");
			completedButton.innerHTML="<i class='fas fa-check'></i>";
			completedButton.classList.add("complete-btn");
			todoDiv.appendChild(completedButton);
			//Trash Button
			const trashButton = document.createElement("button");
			trashButton.innerHTML = "<i class='fas fa-trash'></i>";
			trashButton.classList.add("trash-btn");
			todoDiv.appendChild(trashButton);
			//Append TodoList
			this.todoList.appendChild(todoDiv);
			this.mainDiv.appendChild(this.todoList);
			this.inputForm.value = "";

			//Update Number Char Input
			this.onChange();
		}
	}
	public todoDeleteCheck(event:Event): void{
		const item = event.target as HTMLElement;
		if(item.classList[0] === "trash-btn"){
			const todo = item.parentElement;
			if(todo != null){
				todo.classList.add("fall");
				todo.addEventListener("transitionend", ()=>{
					todo.remove();
				})
			}
			
		}
		if(item.classList[0]=== "complete-btn"){

			const todo = item.parentElement;
			if(todo != null){
				todo.classList.toggle("completed");
			}
		}
	}
	public onChange() : void {
		const charRemaing = this.maxCharLimit - this.inputForm.value.length;
		this.outputLabel.innerHTML = `Caratteri Disponibili Nome: ${charRemaing}/${this.maxCharLimit}`;
		this.NOtifyOutputChanged();		
	}
}