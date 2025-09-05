import jwt from 'jsonwebtoken';

export const authenticate = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided!"})

    const token = authHeader.split(" ")[1]
    const secret = process.env.AUTH_SECRETKEY || "my-secret-key"

    try {
        const decoded = jwt.verify(token,secret)
        req.account = decoded;
        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid token!"})
    }

};

export const authorize = (types = []) => (req,res,next) => {
    if (!req.account) return res.status(401).json({ message: "Not authenticated!"})
        if (types.length && !types.includes(req.account.type)) {
            return res.status(403).json({ message: "Not allowed: insufficient permissions"})
        }
    next();     
}