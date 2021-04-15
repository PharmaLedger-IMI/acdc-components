FROM node:14.16-buster

RUN apt update

RUN apt install -y build-essential 

RUN apt install -y libpq-dev

ENV TARGET_FOLDER_NAME="acdc-workspace"
RUN git clone https://github.com/PharmaLedger-IMI/acdc-workspace.git $TARGET_FOLDER_NAME

RUN cd $TARGET_FOLDER_NAME && cd backoffice-backend && \
    npm install --unsafe-perm

RUN cd $TARGET_FOLDER_NAME && cd backoffice-backend && \
    echo 'npm run start' >> startup-script.sh
RUN cd $TARGET_FOLDER_NAME && cd backoffice-backend && cat startup-script.sh

EXPOSE 3000/tcp

CMD cd $TARGET_FOLDER_NAME && cd backoffice-backend && \
    bash startup-script.sh
