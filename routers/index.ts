import { Application, Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import { resolve } from 'path';
import api from './api';

const express = require('express');

export default function configureRoutes(app: Application) {
    app.get('/', (req, res, next) => {
            res.sendFile(resolve(__dirname, '../../index.html'));
        })
        .use(express.static('public'))
        .use(express.static('dist'))
        .use(json())
        .use('/api', api())
        .use('/error', (req, res, next) => {
            next(new Error('Other Error'));
        })
        .use((req, res, next) => {
            next(new Error('Not Found'));
        })
        .use((error: Error, req: Request, res: Response, next: NextFunction) => {
            switch (error.message) {
                case 'Not Found':
                    res.sendFile(resolve('static-files', 'notfound.html'));
                    return;
            }

            res.sendFile(resolve('static-files', 'error.html'));
        });
}