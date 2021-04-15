# Stage 1 - build prod files inside docker - runs one level above
FROM node:14.16-buster as build-step


ENV TARGET_FOLDER_NAME="acdc-workspace"
RUN git clone https://github.com/PharmaLedger-IMI/acdc-workspace.git $TARGET_FOLDER_NAME

RUN cd $TARGET_FOLDER_NAME && cd backoffice-frontend && \
    npm install --unsafe-perm

RUN cd $TARGET_FOLDER_NAME && cd backoffice-frontend && \
    npm run build -- --prod

# Stage 2 - put files inside an apache 2.4 web server

FROM httpd:2.4

# httpd.conf contains some tweaks - compare with httpd.conf.orig
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

RUN mkdir /usr/local/apache2/htdocs/backoffice

COPY --from=build-step /acdc-workspace/backoffice-frontend/dist/acdc-backoffice-frontend /usr/local/apache2/htdocs/backoffice/
