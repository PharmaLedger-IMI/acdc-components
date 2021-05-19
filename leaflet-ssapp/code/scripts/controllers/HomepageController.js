import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

export default class HomepageController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        let clickCounter = 0;

        element.querySelector("psk-slideshow").addEventListener("click", (event)=>{
            clickCounter++;
            if(clickCounter === 1){
                interval = setTimeout(()=>{
                    clickCounter = 0;
                }, 5000);
            }
            if(clickCounter === 5){
                clickCounter = 0;
                history.push({
                    pathname: `${new URL(history.win.basePath).pathname}settings`,
                });
            }
        });
    }
}
