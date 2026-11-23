[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/co02Vmtr)

## Requirements for Group Project

[Read the instruction](https://github.com/STIWK2124-A242/class-activity-stiwk2124/blob/main/Group_Project_Guideline.md)

## Refer to the link below for the `Group Name` and `Group Members`

https://github.com/STIWK2124-A242/class-activity-stiwk2124/blob/main/NewGroupMembers.md

## Group Info:

1. Matric Number & Name & Photo & Phone Number
1. Mention who the leader is.
1. Mention your group name for Assignment-1 and Assignment-2
1. Other related info (if any)

| Group Member       | #1                                                                                                       | #2                                                                                                       | #3                                                                                                       | #4                                                                                                       | #5                                                                                                       | #6                                                                                        | #7  |
| ------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --- |
| Name               | CHONG YONG XUAN (Leader)                                                                                 | POH PING SENG                                                                                            | SITI NURBATRISHA BT ABD HALIM                                                                            | NUR FATIHAH BINTI ISMAIL                                                                                 | MUHAMMAD RIZKI FATRA                                                                                     | MUHAMMAD FAQRIEZ FARHAN BIN ROHAIDZAM                                                     |     |
| Matric Number      | 291692                                                                                                   | 293403                                                                                                   | 292828                                                                                                   | 292013                                                                                                   | 290911                                                                                                   | 294988                                                                                    |     |
| Phone Number       | 018-5787201                                                                                              | 011-26449649                                                                                             | 017-9134281                                                                                              | 019-9744370                                                                                              | 016-2508620                                                                                              | 017-4429742                                                                               |     |
| A1 & A2 Group Name | nezha & nezha2                                                                                           | nezha & nezha2                                                                                           | webexians & webexian                                                                                     | webexians & webexian                                                                                     | webexians & webexian                                                                                     | repo-ranger                                                                               |     |
| Picture            | <img src="https://github.com/user-attachments/assets/29408cd8-3dc7-41be-89c0-be5773c3a79c" width="100"/> | <img src="https://github.com/user-attachments/assets/131fbfd4-5867-43ca-8da3-7cb442b4d810" width="100"/> | <img src="https://github.com/user-attachments/assets/177e2d82-8a2f-4f2c-866a-93c0ac2baca5" width="100"/> | <img src="https://github.com/user-attachments/assets/333a5702-b700-4615-9274-9861f5ffbae5" width="100"/> | <img src="https://github.com/user-attachments/assets/c480afab-30bc-4ac2-b5d8-e7f48da752e8" width="100"/> | ![Image](https://github.com/user-attachments/assets/6fba3b5b-606c-475a-bb40-035f2faf5f24) |     |

<br>
<br>

## Title of your application (a unique title)

Qurba E-commerce

## Abstract (in 300 words)

1.  Background

    Produk AMEEN is a product line under Qurba Food Industries, specializing in Malaysian-made food items like sauces, spice blends, and herbal honey. While the current WordPress website serves as a static catalog for product display, it lacks transactional features and backend management, limiting the business's growth in the digital commerce space.

2.  Problem Statement (from article)

    The current platform does not support online purchasing, order management, or customer interaction, which are crucial for scaling operations. Small businesses like Produk AMEEN often lack access to full-stack, scalable e-commerce solutions tailored to their operational needs. This results in lost sales opportunities, inefficient inventory control, and a poor customer experience.

3.  Main objective

    To develop a fully functional e-commerce web application for Produk AMEEN using Angular and Spring Boot that enables product browsing, cart management, order placement, and admin-level product/order control. The project follows Agile methodology and integrates Docker for consistent development and deployment.

4.  Methodology

    The frontend was built using Angular and styled with Angular Material for a responsive UI. The backend uses Spring Boot with a REST API architecture, connected to a MySQL database. GitHub is used for version control. Docker is used to containerize both frontend and backend applications, managed through a docker-compose.yml file. Agile methodology was adopted, with iterative development and regular sprint reviews.

5.  Result

    The system successfully implements all required components: home, products, shopping cart, checkout, order confirmation, user order history, and admin panels for products and orders. User authentication and role-based access control were implemented. Docker images were pushed to Docker Hub, and the application is ready for deployment.

6.  Conclusion
    This project demonstrates how combining Angular, Spring Boot, and Docker under Agile methodology can produce a scalable, maintainable e-commerce platform. It offers Produk AMEEN a robust foundation for expanding its online business and improving operational efficiency.

## Link for Docker Image

## Instructions on how to run Docker.

## List of all the endpoints

### Auth

- POST `/api/auth/register` — Register a new user
- POST `/api/auth/login` — User login
- POST `/api/auth/admin/login` — Admin login

### Users

- GET `/api/users/profile` — Get user profile
- PUT `/api/users/profile` — Update user profile

### Products

- GET `/api/products` — List all products
- GET `/api/products/filter` — Filter products
- GET `/api/products/sort` — Sort products
- GET `/api/products/search` — Search products
- GET `/api/products/{id}` — Get product by ID
- GET `/api/products/search-filter-sort` — Search, filter, and sort products
- POST `/api/products` — Add a new product
- DELETE `/api/products/{id}` — Delete a product
- PUT `/api/products/{id}` — Update a product

### Product Reviews

- POST `/api/products/{productId}/reviews` — Add a review to a product
- GET `/api/products/{productId}/reviews` — Get reviews for a product
- GET `/api/products/{productId}/rating` — Get product rating

### Cart

- GET `/api/cart/test` — Test endpoint
- GET `/api/cart/{userId}` — Get user's cart
- POST `/api/cart/{userId}/add` — Add item to cart
- PUT `/api/cart/{userId}/update` — Update cart item
- DELETE `/api/cart/{userId}/remove` — Remove item from cart
- DELETE `/api/cart/{userId}/clear` — Clear user's cart

### Wishlist

- GET `/api/wishlist/{userId}` — Get user's wishlist
- POST `/api/wishlist/{userId}/add/{productId}` — Add product to wishlist
- DELETE `/api/wishlist/{userId}/remove/{productId}` — Remove product from wishlist
- GET `/api/wishlist/{userId}/check/{productId}` — Check if product is in wishlist

### Orders

- GET `/api/orders/{userId}` — Get user's orders
- GET `/api/orders/{orderId}/summary` — Get order summary
- GET `/api/orders/admin/all` — Get all orders (admin)

### Checkout

- POST `/api/checkout/{userId}` — Checkout for user

### Images

- POST `/api/images/upload` — Upload an image
- DELETE `/api/images/delete` — Delete an image
- GET `/api/images/product/{category}/{filename}` — Get product image by category and filename
- GET `/api/images/product/default` — Get default product image

### Admin

- GET `/api/admin/products` — List all products (admin)
- POST `/api/admin/products` — Add product (admin)
- PUT `/api/admin/products/{id}` — Update product (admin)
- DELETE `/api/admin/products/{id}` — Delete product (admin)
- GET `/api/admin/orders` — List all orders (admin)

## Link for the YouTube Presentation

## Result/Output (Screenshot of the output)

## References (Not less than 20)
# FullStack-E-commerce
