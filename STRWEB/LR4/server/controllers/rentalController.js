const Rental = require("../models/Rental");
const Car = require("../models/Car");
const User = require("../models/User");

// Create a new rental request
exports.createRental = async (req, res) => {
    const { carId, rentalDate, returnDate } = req.body;
    const userId = req.user.id; // From authMiddleware

    try {
        // Check if car exists and is available
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ msg: "Car not found" });
        }
        if (car.status !== "available") {
            return res
                .status(400)
                .json({ msg: "Car is not available for rent" });
        }

        // Calculate total cost
        const start = new Date(rentalDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalCost = car.dailyRate * diffDays;

        const newRental = new Rental({
            car: carId,
            user: userId,
            rentalDate,
            returnDate,
            totalCost,
        });

        const rental = await newRental.save();

        car.status = "rented";
        await car.save();

        // Add rental to user's history
        const user = await User.findById(userId);
        user.rentalHistory.push(rental._id);
        await user.save();

        res.json(rental);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Get current user's rentals
exports.getMyRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ user: req.user.id })
            .populate("car user", "brand model name email")
            .sort({ createdAt: -1 });
        res.json(rentals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// --- Admin Functions ---

// Get all rentals pending approval
exports.getPendingRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ status: "pending_approval" })
            .populate("car user", "brand model name email")
            .sort({ createdAt: "asc" });
        res.json(rentals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Approve a rental request
exports.approveRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id).populate("car");
        if (!rental) {
            return res.status(404).json({ msg: "Rental not found" });
        }
        if (rental.status !== "pending_approval") {
            return res
                .status(400)
                .json({ msg: "Rental is not pending approval" });
        }

        const car = rental.car;

        // --- Update rental based on approval ---
        rental.rentalDate = new Date(); // Set start date to now
        rental.status = "active";
        // Car status is already 'rented', no change needed here.

        // Recalculate cost based on the new start date
        const start = rental.rentalDate;
        const end = new Date(rental.returnDate);
        if (end < start) {
            // If the original return date is now in the past, the rental is invalid.
            // Reject it and make the car available again.
            rental.status = "rejected";
            car.status = "available";
            await rental.save();
            await car.save();
            return res
                .status(400)
                .json({ msg: "Return date is in the past. Rental rejected." });
        }
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        rental.totalCost = car.dailyRate * diffDays;

        await rental.save();
        // No need to save car if its status didn't change
        // await car.save();

        res.json(rental);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Reject a rental request
exports.rejectRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) {
            return res.status(404).json({ msg: "Rental not found" });
        }
        if (rental.status !== "pending_approval") {
            return res
                .status(400)
                .json({ msg: "Rental is not pending approval" });
        }

        // Make the car available again
        const car = await Car.findById(rental.car);
        if (car) {
            car.status = "available";
            await car.save();
        }

        rental.status = "rejected";
        await rental.save();

        res.json({ msg: "Rental rejected and car is now available." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Complete a rental (process a return)
exports.completeRental = async (req, res) => {
    const { returnComments } = req.body;
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) {
            return res.status(404).json({ msg: "Rental not found" });
        }
        if (rental.status !== "active") {
            return res
                .status(400)
                .json({ msg: "This rental is not currently active." });
        }

        // Update rental
        rental.status = "completed";
        rental.actualReturnDate = new Date();
        if (returnComments) {
            rental.returnComments = returnComments;
        }
        await rental.save();

        // Update car status
        const car = await Car.findById(rental.car);
        if (car) {
            car.status = "available";
            await car.save();
        }

        res.json(rental);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
