import React from 'react'
import './Static.css'
import { Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap'

const Navigation = () => {
  return (
    <Navbar bg="dark" variant="dark" id="navbar" >
      <Navbar.Brand href="/">TradingStocks</Navbar.Brand>
      <Nav className="mr-auto">
        <Nav.Link href="/">Home</Nav.Link>
        <Nav.Link href="/main">Trade</Nav.Link>
        <Nav.Link href="/portfolio">Potrfolio</Nav.Link>
      </Nav>
      <Form inline>
        <FormControl type="text" placeholder="Search" className="mr-sm-2" />
        <Button variant="outline-info">Search</Button>
      </Form>
    </Navbar>
  )
}

export default Navigation